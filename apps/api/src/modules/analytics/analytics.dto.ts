import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class AnalyticsQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsEnum(['COURSE', 'WORKSHOP', 'MEMBERSHIP', 'PRODUCT'])
  @IsOptional()
  orderType?: 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class TrackEventDto {
  @IsString()
  eventType!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
