import { IsString, IsOptional, IsNumber, IsEnum, IsUrl, Min, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  @IsOptional()
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsString()
  @IsOptional()
  language?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  @IsOptional()
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsString()
  @IsOptional()
  language?: string;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;
}

export class CreateSectionDto {
  @IsString()
  title!: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateLessonDto {
  @IsString()
  title!: string;

  @IsEnum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'])
  @IsOptional()
  type?: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  content?: any;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dripAfterDays?: number;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'])
  @IsOptional()
  type?: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  content?: any;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dripAfterDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class ReorderDto {
  items!: Array<{ id: string; order: number }>;
}

export class EnrollDto {
  @IsOptional()
  couponCode?: string;
}

export class SubmitQuizDto {
  @IsObject()
  answers!: Record<string, string>;
}

export class SubmitAssignmentDto {
  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class GradeAssignmentDto {
  @IsNumber()
  @Min(0)
  score!: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsString()
  @IsOptional()
  aiFeedback?: string;
}

export class ManagedQuestionDto {
  @IsEnum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'])
  @IsOptional()
  type?: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';

  @IsString()
  questionText!: string;

  @IsOptional()
  options?: any;

  @IsString()
  correctAnswer!: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpsertManagedQuizDto {
  @IsString()
  title!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  passingScore?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttempts?: number;

  @IsArray()
  @IsOptional()
  questions?: ManagedQuestionDto[];
}

export class UpsertManagedAssignmentDto {
  @IsString()
  title!: string;

  @IsString()
  instructions!: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;
}
