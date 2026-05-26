import { IsString, IsOptional, IsUrl, IsJSON, IsObject } from 'class-validator';

export class CreateCreatorDto {
  @IsString()
  brandName!: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsObject()
  @IsOptional()
  payoutSettings?: Record<string, any>;
}

export class UpdateCreatorDto {
  @IsString()
  @IsOptional()
  brandName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsObject()
  @IsOptional()
  payoutSettings?: Record<string, any>;
}