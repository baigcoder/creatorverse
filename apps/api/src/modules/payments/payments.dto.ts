import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsUrl } from 'class-validator';

export class CheckoutDto {
  @IsEnum(['COURSE', 'WORKSHOP', 'MEMBERSHIP', 'PRODUCT'])
  orderType!: 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';

  @IsString()
  referenceId!: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  couponId?: string;

  @IsString()
  @IsOptional()
  affiliateId?: string;

  @IsEnum(['STRIPE', 'RAZORPAY'])
  @IsOptional()
  paymentProvider?: 'STRIPE' | 'RAZORPAY';

  @IsUrl({ require_tld: false })
  @IsOptional()
  successUrl?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  cancelUrl?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class RefundDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class RazorpayVerifyDto {
  @IsString()
  razorpayOrderId!: string;

  @IsString()
  razorpayPaymentId!: string;

  @IsString()
  razorpaySignature!: string;
}
