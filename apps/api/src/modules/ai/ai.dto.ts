import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export class GenerateCourseOutlineDto {
  @IsString()
  topic!: string;

  @IsString()
  @IsOptional()
  audience?: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  @IsOptional()
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsString()
  @IsOptional()
  tone?: string;
}

export class GenerateQuizDto {
  @IsString()
  content!: string;

  @IsEnum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'])
  @IsOptional()
  questionType?: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';

  @IsNumber()
  @IsOptional()
  questionCount?: number;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  @IsOptional()
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export class TutorChatDto {
  @IsString()
  question!: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class GenerateLandingCopyDto {
  @IsString()
  courseTitle!: string;

  @IsString()
  @IsOptional()
  courseDescription?: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  tone?: string;
}

export class AssignmentFeedbackDto {
  @IsString()
  assignmentInstructions!: string;

  @IsString()
  submission!: string;

  @IsString()
  @IsOptional()
  rubric?: string;
}

export class SuggestImprovementsDto {
  @IsString()
  courseId!: string;
}
