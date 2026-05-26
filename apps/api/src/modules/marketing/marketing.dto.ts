import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  @IsOptional()
  previewText?: string;

  @IsString()
  body!: string;

  @IsEnum(['ALL', 'LEARNERS', 'CUSTOMERS', 'MEMBERS'])
  @IsOptional()
  audience?: 'ALL' | 'LEARNERS' | 'CUSTOMERS' | 'MEMBERS';
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  previewText?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsEnum(['ALL', 'LEARNERS', 'CUSTOMERS', 'MEMBERS'])
  @IsOptional()
  audience?: 'ALL' | 'LEARNERS' | 'CUSTOMERS' | 'MEMBERS';

  @IsEnum(['DRAFT', 'SCHEDULED', 'SENT', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'ARCHIVED';
}
