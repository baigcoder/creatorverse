import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsEnum(['STREAK', 'COMPLETION', 'CONTRIBUTION', 'SOCIAL', 'SPECIAL'])
  @IsOptional()
  type?: 'STREAK' | 'COMPLETION' | 'CONTRIBUTION' | 'SOCIAL' | 'SPECIAL';

  @IsOptional()
  criteria?: Record<string, any>;
}

export class CreateChallengeDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['STREAK', 'COMPLETION', 'SOCIAL', 'POINTS'])
  @IsOptional()
  type?: 'STREAK' | 'COMPLETION' | 'SOCIAL' | 'POINTS';

  @IsOptional()
  criteria?: Record<string, any>;

  @IsOptional()
  reward?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}