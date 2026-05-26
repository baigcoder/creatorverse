import { Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CheckoutDto, RazorpayVerifyDto, RefundDto } from './payments.dto';
import { Public } from '../../common/decorators/public.decorator';
import { SkipCsrf } from '../../common/decorators/skip-csrf.decorator';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@CurrentUser() user: { id: string }, @Body() dto: CheckoutDto) {
    return this.paymentsService.checkout(user.id, dto);
  }

  @Post('payments/webhook/stripe')
  @Public()
  @SkipCsrf()
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, payload, signature);
  }

  @Post('payments/webhook/razorpay')
  @Public()
  @SkipCsrf()
  razorpayWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature?: string) {
    return this.paymentsService.handleRazorpayWebhook(payload, signature);
  }

  @Post('payments/razorpay/verify')
  @UseGuards(JwtAuthGuard)
  verifyRazorpay(@CurrentUser() user: { id: string }, @Body() dto: RazorpayVerifyDto) {
    return this.paymentsService.verifyRazorpayPayment(user.id, dto);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  orders(@CurrentUser() user: { id: string }, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.paymentsService.orders(user.id, Number(page), Number(limit));
  }

  @Post('orders/:id/refund')
  @UseGuards(JwtAuthGuard)
  refund(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: RefundDto) {
    return this.paymentsService.refund(id, user.id, dto);
  }
}
