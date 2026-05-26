import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUrl } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsEnum(['ZOOM', 'GOOGLE_MEET', 'WEBEX', 'CUSTOM'])
  @IsOptional()
  meetingProvider?: 'ZOOM' | 'GOOGLE_MEET' | 'WEBEX' | 'CUSTOM';

  @IsUrl()
  @IsOptional()
  meetingUrl?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  maxAttendees?: number;
}

export class UpdateWorkshopDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(['DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

  @IsUrl()
  @IsOptional()
  replayUrl?: string;
}