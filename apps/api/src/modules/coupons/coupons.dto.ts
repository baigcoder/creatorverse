import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  @IsOptional()
  discountType?: 'PERCENTAGE' | 'FIXED';

  @IsNumber()
  discountValue!: number;

  @IsNumber()
  @IsOptional()
  maxRedemptions?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsEnum(['COURSE', 'WORKSHOP', 'MEMBERSHIP', 'PRODUCT'])
  @IsOptional()
  applicableType?: 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';

  @IsString()
  @IsOptional()
  applicableId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class UpdateCouponDto {
  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  maxRedemptions?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class ValidateCouponDto {
  @IsString()
  code!: string;

  @IsEnum(['COURSE', 'WORKSHOP', 'MEMBERSHIP', 'PRODUCT'])
  @IsOptional()
  applicableType?: 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';

  @IsString()
  @IsOptional()
  applicableId?: string;
}
