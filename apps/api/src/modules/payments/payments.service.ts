import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CheckoutDto, RazorpayVerifyDto, RefundDto } from './payments.dto';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import { AnalyticsEventService } from '../../common/services/analytics-event.service';
import { EmailService } from '../../common/services/email.service';
import { GamificationTriggerService } from '../../common/services/gamification-trigger.service';
import { NotificationDispatcher } from '../../common/services/notification-dispatcher.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private analyticsEvents: AnalyticsEventService,
    private gamification: GamificationTriggerService,
    private notifications: NotificationDispatcher,
    private emailService: EmailService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    this.stripe = secretKey ? new Stripe(secretKey, { apiVersion: '2025-08-27.basil' }) : null;
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const item = await this.resolvePurchasable(dto.orderType, dto.referenceId);
    const creatorId = item.creatorId;
    const subtotal = Number(item.amount);
    const currency = item.currency ?? 'USD';
    const discountAmount = await this.resolveDiscountAmount(dto.couponId, dto.orderType, dto.referenceId, creatorId, subtotal);
    const amount = Math.max(0, subtotal - discountAmount);
    const metadata = {
      ...(dto.metadata ?? {}),
      requestedAmount: dto.amount,
      requestedCurrency: dto.currency,
      requestedDiscountAmount: dto.discountAmount,
      serverSubtotal: subtotal,
      serverDiscountAmount: discountAmount,
    };
    const order = await this.prisma.order.create({
      data: {
        userId,
        creatorId,
        orderType: dto.orderType,
        referenceId: dto.referenceId,
        amount,
        currency,
        discountAmount,
        couponId: dto.couponId,
        affiliateId: dto.affiliateId,
        status: 'PENDING',
        paymentProvider: dto.paymentProvider ?? 'STRIPE',
        metadata: metadata as Prisma.InputJsonObject,
      },
    });

    await this.runSideEffect('checkout analytics', async () => {
      await this.analyticsEvents.trackCheckoutStarted(userId, creatorId, dto.orderType, dto.referenceId);
    });

    if (this.stripe && (dto.paymentProvider ?? 'STRIPE') === 'STRIPE') {
      const session = await this.stripe.checkout.sessions.create({
        mode: dto.orderType === 'MEMBERSHIP' ? 'subscription' : 'payment',
        success_url: dto.successUrl ?? `${this.configService.get('app.frontendUrl')}/checkout/success?orderId=${order.id}`,
        cancel_url: dto.cancelUrl ?? `${this.configService.get('app.frontendUrl')}/checkout/cancel?orderId=${order.id}`,
        client_reference_id: order.id,
        metadata: {
          orderId: order.id,
          orderType: dto.orderType,
          referenceId: dto.referenceId,
          userId,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: currency.toLowerCase(),
              unit_amount: Math.round(Number(amount) * 100),
              product_data: {
                name: item.title,
                description: item.description,
              },
              recurring: dto.orderType === 'MEMBERSHIP' ? { interval: item.interval === 'YEARLY' ? 'year' : 'month' } : undefined,
            },
          },
        ],
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: { providerPaymentId: session.id, metadata: { ...metadata, checkoutSessionId: session.id } as Prisma.InputJsonObject },
      });

      return {
        mode: 'provider_redirect',
        order,
        checkoutUrl: session.url,
        providerSessionId: session.id,
      };
    }

    if ((dto.paymentProvider ?? 'STRIPE') === 'RAZORPAY') {
      const razorpayOrder = await this.createRazorpayOrder(order.id, Number(amount), currency);
      if (razorpayOrder) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            providerPaymentId: razorpayOrder.id,
            metadata: { ...metadata, razorpayOrderId: razorpayOrder.id } as Prisma.InputJsonObject,
          },
        });
        return {
          mode: 'razorpay_order',
          order: { ...order, providerPaymentId: razorpayOrder.id },
          provider: 'RAZORPAY',
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: this.configService.get<string>('razorpay.keyId') || '',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          checkoutUrl: null,
        };
      }

      return {
        mode: 'dev_pending',
        order,
        checkoutUrl: null,
        provider: 'RAZORPAY',
        message: 'Development pending order created. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable hosted Razorpay checkout.',
      };
    }

    return {
      mode: 'dev_pending',
      order,
      checkoutUrl: null,
      message: 'Development pending order created. Add STRIPE_SECRET_KEY to enable hosted checkout sessions.',
    };
  }

  orders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.order.findMany({
      where: { userId },
      include: { payments: true, refunds: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async refund(orderId: string, userId: string, dto: RefundDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found');
    let providerRefundId: string | undefined;
    let status = 'PENDING';

    if (this.stripe && order.paymentProvider === 'STRIPE' && order.providerPaymentId) {
      try {
        const session = await this.stripe.checkout.sessions.retrieve(order.providerPaymentId);
        const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
        if (paymentIntent) {
          const refund = await this.stripe.refunds.create({
            payment_intent: paymentIntent,
            amount: Math.round(Number(dto.amount ?? order.amount) * 100),
            reason: 'requested_by_customer',
          });
          providerRefundId = refund.id;
          status = refund.status ?? 'PENDING';
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Stripe refund fallback for order ${order.id}: ${message}`);
      }
    }

    const refund = await this.prisma.refund.create({
      data: {
        orderId,
        amount: dto.amount ?? order.amount,
        reason: dto.reason ?? 'Requested by customer',
        status,
        providerRefundId,
      },
    });

    if (Number(refund.amount) >= Number(order.amount)) {
      await this.prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED' } });
    }

    return refund;
  }

  async handleStripeWebhook(rawBody: Buffer | undefined, payload: any, signature?: string) {
    let event = payload;
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (this.stripe && webhookSecret) {
      if (!rawBody || !signature) throw new BadRequestException('Missing Stripe webhook signature');
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (orderId) await this.fulfillOrder(orderId, session.id, 'STRIPE');
    }

    return { received: true, provider: 'STRIPE', eventId: event.id ?? null };
  }

  async handleRazorpayWebhook(payload: any, signature?: string) {
    const webhookSecret = this.configService.get<string>('razorpay.webhookSecret');
    if (webhookSecret && signature && payload) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (expectedSignature !== signature) {
        throw new BadRequestException('Invalid Razorpay webhook signature');
      }
    }

    const event = payload?.event;
    if (event === 'payment.captured') {
      const paymentEntity = payload?.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;
      if (orderId) {
        await this.fulfillOrder(orderId, paymentEntity?.id, 'RAZORPAY');
      }
    }

    return { received: true, provider: 'RAZORPAY', event };
  }

  async verifyRazorpayPayment(userId: string, dto: RazorpayVerifyDto) {
    const keySecret = this.configService.get<string>('razorpay.keySecret') || '';
    if (!keySecret) throw new BadRequestException('Razorpay verification is not configured');

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    const order = await this.prisma.order.findFirst({
      where: { userId, providerPaymentId: dto.razorpayOrderId, paymentProvider: 'RAZORPAY' },
    });
    if (!order) throw new NotFoundException('Razorpay order not found');

    return this.fulfillOrder(order.id, dto.razorpayPaymentId, 'RAZORPAY');
  }

  private async fulfillOrder(orderId: string, providerPaymentId: string, provider: 'STRIPE' | 'RAZORPAY') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'COMPLETED') return order;

    const completedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED', providerPaymentId },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        provider,
        providerPaymentId,
        status: 'COMPLETED',
      },
    });

    await this.runSideEffect('payment completion analytics', async () => {
      await this.analyticsEvents.trackPaymentComplete(order.userId, order.creatorId, order.id, Number(order.amount));
    });

    if (order.orderType === 'COURSE') {
      await this.prisma.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.referenceId } },
        update: { status: 'ACTIVE' },
        create: { userId: order.userId, courseId: order.referenceId, status: 'ACTIVE' },
      });
      await this.runSideEffect('paid course enrollment events', async () => {
        const [course, user] = await Promise.all([
          this.prisma.course.findUnique({ where: { id: order.referenceId }, select: { id: true, title: true } }),
          this.prisma.user.findUnique({ where: { id: order.userId }, select: { email: true, name: true } }),
        ]);
        if (!course) return;
        await Promise.all([
          this.gamification.onCourseEnrollment(order.userId, course.id),
          this.notifications.sendEnrollmentConfirmation(order.userId, course.title, course.id),
          user?.email ? this.emailService.sendEnrollmentEmail(user.email, user.name, course.title) : Promise.resolve(),
        ]);
      });
    }

    if (order.orderType === 'WORKSHOP') {
      await this.prisma.workshopRegistration.upsert({
        where: { workshopId_userId: { workshopId: order.referenceId, userId: order.userId } },
        update: { orderId: order.id },
        create: { workshopId: order.referenceId, userId: order.userId, orderId: order.id },
      });
      await this.runSideEffect('workshop registration notification', async () => {
        const workshop = await this.prisma.workshop.findUnique({
          where: { id: order.referenceId },
          select: { id: true, title: true },
        });
        if (workshop) {
          await this.notifications.sendWorkshopReminder(order.userId, workshop.title, workshop.id);
        }
      });
    }

    if (order.orderType === 'MEMBERSHIP') {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { id: order.referenceId } });
      if (plan) {
        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + (plan.interval === 'YEARLY' ? 12 : 1));
        await this.prisma.subscription.create({
          data: { userId: order.userId, planId: plan.id, currentPeriodStart: now, currentPeriodEnd: end, status: 'ACTIVE' },
        });
      }
    }

    await this.runSideEffect('affiliate commission', async () => {
      if (!order.affiliateId) return;
      const affiliate = await this.prisma.affiliate.findUnique({ where: { id: order.affiliateId } });
      if (!affiliate || affiliate.status !== 'ACTIVE') return;

      const commission =
        affiliate.commissionType === 'FIXED'
          ? Number(affiliate.commissionRate)
          : (Number(order.amount) * Number(affiliate.commissionRate)) / 100;

      if (commission <= 0) return;

      await this.prisma.affiliateEarning.create({
        data: {
          affiliateId: affiliate.id,
          userId: affiliate.userId,
          orderId: order.id,
          amount: Math.min(commission, Number(order.amount)),
          status: 'PENDING',
        },
      });
    });

    return completedOrder;
  }

  private async createRazorpayOrder(orderId: string, amount: number, currency: string) {
    const keyId = this.configService.get<string>('razorpay.keyId') || '';
    const keySecret = this.configService.get<string>('razorpay.keySecret') || '';
    if (!keyId || !keySecret) return null;

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        receipt: orderId,
        notes: { orderId },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.warn(`Razorpay order creation failed: ${response.status} ${body}`);
      return null;
    }

    return response.json() as Promise<{ id: string; amount: number; currency: string }>;
  }

  private async runSideEffect(label: string, effect: () => Promise<void>) {
    try {
      await effect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Skipped ${label}: ${message}`);
    }
  }

  private async resolvePurchasable(orderType: string, referenceId: string) {
    if (orderType === 'COURSE') {
      const course = await this.prisma.course.findUnique({ where: { id: referenceId } });
      if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not found');
      return { creatorId: course.creatorId, title: course.title, description: course.description ?? undefined, amount: course.price, currency: course.currency };
    }
    if (orderType === 'WORKSHOP') {
      const workshop = await this.prisma.workshop.findUnique({ where: { id: referenceId } });
      if (!workshop || !['SCHEDULED', 'LIVE'].includes(workshop.status)) throw new NotFoundException('Workshop not found');
      return { creatorId: workshop.creatorId, title: workshop.title, description: workshop.description ?? undefined, amount: workshop.price, currency: workshop.currency };
    }
    if (orderType === 'MEMBERSHIP') {
      const plan = await this.prisma.membershipPlan.findUnique({ where: { id: referenceId } });
      if (!plan || plan.status !== 'PUBLISHED') throw new NotFoundException('Membership plan not found');
      return { creatorId: plan.creatorId, title: plan.name, description: plan.description ?? undefined, amount: plan.price, currency: plan.currency, interval: plan.interval };
    }
    if (orderType === 'PRODUCT') {
      const product = await this.prisma.product.findUnique({ where: { id: referenceId } });
      if (!product || product.status !== 'PUBLISHED') throw new NotFoundException('Product not found');
      return { creatorId: product.creatorId, title: product.title, description: product.description ?? undefined, amount: product.price, currency: product.currency };
    }
    throw new BadRequestException('Unsupported order type');
  }

  private async resolveDiscountAmount(couponId: string | undefined, orderType: string, referenceId: string, creatorId: string, subtotal: number) {
    if (!couponId) return 0;

    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon || coupon.status !== 'PUBLISHED') throw new BadRequestException('Coupon is not active');
    if (coupon.creatorId !== creatorId) throw new BadRequestException('Coupon does not apply to this creator');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
    if (coupon.maxRedemptions && coupon.usedCount >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon redemption limit reached');
    }
    if (coupon.applicableType && coupon.applicableType !== orderType) {
      throw new BadRequestException('Coupon does not apply to this item');
    }
    if (coupon.applicableId && coupon.applicableId !== referenceId) {
      throw new BadRequestException('Coupon does not apply to this item');
    }

    const discountValue = Number(coupon.discountValue);
    const discount = coupon.discountType === 'PERCENTAGE' ? (subtotal * discountValue) / 100 : discountValue;
    return Math.min(subtotal, Math.max(0, Number(discount.toFixed(2))));
  }
}
