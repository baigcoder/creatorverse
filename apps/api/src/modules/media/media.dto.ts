import { IsEnum, IsObject, IsOptional, IsNumber, IsString } from 'class-validator';

export class UploadPolicyDto {
  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsNumber()
  size!: number;

  @IsString()
  @IsOptional()
  folder?: string;
}

export class CompleteUploadDto {
  @IsString()
  key!: string;

  @IsString()
  filename!: string;

  @IsString()
  contentType!: string;

  @IsNumber()
  size!: number;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsEnum(['PUBLIC', 'PROTECTED', 'PRIVATE'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
