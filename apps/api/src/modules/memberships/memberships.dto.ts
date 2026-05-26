import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(['MONTHLY', 'YEARLY'])
  @IsOptional()
  interval?: 'MONTHLY' | 'YEARLY';

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  communityAccess?: boolean;

  @IsArray()
  @IsOptional()
  courseIds?: string[];

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class UpdateMembershipDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(['MONTHLY', 'YEARLY'])
  @IsOptional()
  interval?: 'MONTHLY' | 'YEARLY';

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  communityAccess?: boolean;

  @IsArray()
  @IsOptional()
  courseIds?: string[];

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}