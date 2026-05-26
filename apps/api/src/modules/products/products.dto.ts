import { IsString, IsNumber, IsOptional, IsEnum, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsEnum(['EBOOK', 'TEMPLATE', 'DOWNLOAD', 'COACHING', 'BUNDLE'])
  type!: 'EBOOK' | 'TEMPLATE' | 'DOWNLOAD' | 'COACHING' | 'BUNDLE';

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}