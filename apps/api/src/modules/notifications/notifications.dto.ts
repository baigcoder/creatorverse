import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsEnum(['EMAIL', 'PUSH', 'IN_APP'])
  channel!: 'EMAIL' | 'PUSH' | 'IN_APP';

  @IsString()
  type!: string;

  @IsBoolean()
  enabled!: boolean;
}