import { IsObject, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(['ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION'])
  status!: 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'PENDING_VERIFICATION';
}

export class AdminQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ModerateContentDto {
  @IsEnum(['APPROVE', 'REJECT', 'PIN', 'UNPIN', 'DELETE'])
  action!: 'APPROVE' | 'REJECT' | 'PIN' | 'UNPIN' | 'DELETE';

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdatePlatformSettingDto {
  @IsString()
  key!: string;

  @IsObject()
  value!: Record<string, unknown>;
}
