import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PUBLIC', 'PRIVATE', 'PAID'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PAID';
}

export class CreateRoomDto {
  @IsString()
  name!: string;

  @IsEnum(['TEXT', 'VOICE', 'ANNOUNCEMENT'])
  @IsOptional()
  type?: 'TEXT' | 'VOICE' | 'ANNOUNCEMENT';

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreatePostDto {
  @IsString()
  content!: string;

  @IsOptional()
  mediaUrls?: any;
}

export class CreateCommentDto {
  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  parentCommentId?: string;
}

export class CreateReactionDto {
  @IsString()
  type!: string;
}

export class CreatePollDto {
  @IsString()
  question!: string;

  @IsOptional()
  options?: any;

  @IsOptional()
  expiresAt?: string;

  @IsOptional()
  allowMultiple?: boolean;
}
