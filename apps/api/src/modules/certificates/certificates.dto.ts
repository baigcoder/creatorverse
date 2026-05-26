import { IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

export class GenerateCertificateDto {
  @IsUUID()
  enrollmentId!: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsOptional()
  certificateUrl?: string;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsObject()
  @IsOptional()
  design?: Record<string, any>;
}