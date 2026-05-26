import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { CourseGeneratorService } from './course-generator.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { TutorService } from './tutor.service';
import { AIProviderFactory } from './providers/ai-provider.factory';

@Module({
  controllers: [AiController],
  providers: [AIProviderFactory, AiService, CourseGeneratorService, QuizGeneratorService, TutorService],
  exports: [AIProviderFactory, AiService, CourseGeneratorService, QuizGeneratorService, TutorService],
})
export class AiModule {}
