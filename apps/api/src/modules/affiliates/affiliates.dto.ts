import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateAffiliateDto {
  @IsString()
  userId!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  commissionRate?: number;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  @IsOptional()
  commissionType?: 'PERCENTAGE' | 'FIXED';
}

export class PayoutAffiliateDto {
  @IsString({ each: true })
  @IsOptional()
  earningIds?: string[];
}
