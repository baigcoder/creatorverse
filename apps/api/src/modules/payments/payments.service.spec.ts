import { describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service';

function createConfigMock(values: Record<string, unknown> = {}) {
  return {
    get: vi.fn((key: string) => values[key]),
  };
}

function createSideEffects() {
  return {
    analytics: {
      trackCheckoutStarted: vi.fn(),
      trackPaymentComplete: vi.fn(),
    },
    gamification: {
      onCourseEnrollment: vi.fn(),
    },
    notifications: {
      sendEnrollmentConfirmation: vi.fn(),
      sendWorkshopReminder: vi.fn(),
    },
    email: {
      sendEnrollmentEmail: vi.fn(),
    },
  };
}

function createService(prisma: unknown, configValues: Record<string, unknown> = {}) {
  const sideEffects = createSideEffects();
  const service = new PaymentsService(
    prisma as never,
    createConfigMock(configValues) as never,
    sideEffects.analytics as never,
    sideEffects.gamification as never,
    sideEffects.notifications as never,
    sideEffects.email as never,
  );
  return { service, sideEffects };
}

describe('PaymentsService', () => {
  it('creates a course order in dev_pending mode when Stripe is not configured', async () => {
    const order = {
      id: 'order_1',
      userId: 'user_1',
      creatorId: 'creator_1',
      orderType: 'COURSE',
      referenceId: 'course_1',
      amount: 49,
      currency: 'USD',
      status: 'PENDING',
      paymentProvider: 'STRIPE',
    };
    const prisma = {
      course: { findUnique: vi.fn().mockResolvedValue({ id: 'course_1', creatorId: 'creator_1', title: 'Course', price: 49, currency: 'USD', status: 'PUBLISHED' }) },
      order: { create: vi.fn().mockResolvedValue(order) },
    };
    const { service } = createService(prisma);

    const result = await service.checkout('user_1', { orderType: 'COURSE', referenceId: 'course_1', paymentProvider: 'STRIPE' });

    expect(result).toMatchObject({
      mode: 'dev_pending',
      checkoutUrl: null,
      order,
    });
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ orderType: 'COURSE', referenceId: 'course_1', amount: 49, discountAmount: 0, paymentProvider: 'STRIPE' }),
    });
  });

  it('computes checkout totals server-side instead of trusting client amounts', async () => {
    const prisma = {
      course: { findUnique: vi.fn().mockResolvedValue({ id: 'course_1', creatorId: 'creator_1', title: 'Course', price: 100, currency: 'USD', status: 'PUBLISHED' }) },
      coupon: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'coupon_1',
          creatorId: 'creator_1',
          status: 'PUBLISHED',
          expiresAt: null,
          maxRedemptions: null,
          usedCount: 0,
          applicableType: 'COURSE',
          applicableId: 'course_1',
          discountType: 'PERCENTAGE',
          discountValue: 25,
        }),
      },
      order: { create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'order_1', ...data })) },
    };
    const { service } = createService(prisma);

    await service.checkout('user_1', {
      orderType: 'COURSE',
      referenceId: 'course_1',
      amount: 1,
      discountAmount: 99,
      couponId: 'coupon_1',
      paymentProvider: 'STRIPE',
    });

    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 75, discountAmount: 25 }),
    });
  });

  it('fulfills Stripe checkout webhooks into completed course enrollments', async () => {
    const pendingOrder = {
      id: 'order_1',
      userId: 'user_1',
      creatorId: 'creator_1',
      orderType: 'COURSE',
      referenceId: 'course_1',
      amount: 49,
      currency: 'USD',
      status: 'PENDING',
      affiliateId: null,
    };
    const completedOrder = { ...pendingOrder, status: 'COMPLETED', providerPaymentId: 'cs_test_1' };
    const prisma = {
      order: {
        findUnique: vi.fn().mockResolvedValue(pendingOrder),
        update: vi.fn().mockResolvedValue(completedOrder),
      },
      payment: { create: vi.fn().mockResolvedValue({ id: 'payment_1' }) },
      enrollment: { upsert: vi.fn().mockResolvedValue({ id: 'enrollment_1' }) },
      course: { findUnique: vi.fn().mockResolvedValue({ id: 'course_1', title: 'Course' }) },
      user: { findUnique: vi.fn().mockResolvedValue({ email: 'learner@example.com', name: 'Learner' }) },
    };
    const { service } = createService(prisma);

    const result = await service.handleStripeWebhook(undefined, {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', client_reference_id: 'order_1', metadata: {} } },
    });

    expect(result).toEqual({ received: true, provider: 'STRIPE', eventId: 'evt_1' });
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order_1' },
      data: { status: 'COMPLETED', providerPaymentId: 'cs_test_1' },
    });
    expect(prisma.enrollment.upsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'user_1', courseId: 'course_1' } },
      update: { status: 'ACTIVE' },
      create: { userId: 'user_1', courseId: 'course_1', status: 'ACTIVE' },
    });
  });

  it('treats duplicate Stripe checkout webhooks as idempotent', async () => {
    const completedOrder = {
      id: 'order_1',
      userId: 'user_1',
      creatorId: 'creator_1',
      orderType: 'PRODUCT',
      referenceId: 'product_1',
      amount: 19,
      currency: 'USD',
      status: 'COMPLETED',
      providerPaymentId: 'cs_test_1',
    };
    const prisma = {
      order: {
        findUnique: vi.fn().mockResolvedValue(completedOrder),
        update: vi.fn(),
      },
      payment: { create: vi.fn() },
      enrollment: { upsert: vi.fn() },
      subscription: { create: vi.fn() },
      workshopRegistration: { upsert: vi.fn() },
    };
    const { service } = createService(prisma);

    const result = await service.handleStripeWebhook(undefined, {
      id: 'evt_duplicate',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1', client_reference_id: 'order_1', metadata: {} } },
    });

    expect(result).toEqual({ received: true, provider: 'STRIPE', eventId: 'evt_duplicate' });
    expect(prisma.order.update).not.toHaveBeenCalled();
    expect(prisma.payment.create).not.toHaveBeenCalled();
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled();
  });
});
