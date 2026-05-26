import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { TutorService } from './tutor.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  GenerateCourseOutlineDto,
  GenerateQuizDto,
  TutorChatDto,
  GenerateLandingCopyDto,
  AssignmentFeedbackDto,
  SuggestImprovementsDto,
} from './ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly tutorService: TutorService,
    private readonly quizGeneratorService: QuizGeneratorService,
  ) {}

  @Post('course-outline')
  async generateCourseOutline(
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateCourseOutlineDto,
  ) {
    const data = await this.aiService.generateCourseOutline({ ...dto, userId: user.id });
    return { success: true, data };
  }

  @Post('lesson-script')
  async generateLessonScript(@Body() dto: { title: string; topic: string; level?: string; duration?: string }) {
    const data = await this.aiService.generateLessonScript(dto);
    return { success: true, data };
  }

  @Post('quiz-generator')
  async generateQuiz(@Body() dto: GenerateQuizDto) {
    const data = await this.quizGeneratorService.generateQuiz(dto);
    return { success: true, data };
  }

  @Post('tutor-chat')
  async tutorChat(@CurrentUser() user: { id: string; role: string }, @Body() dto: TutorChatDto) {
    const data = await this.tutorService.chat(user.id, user.role, dto.question, dto.courseId, dto.conversationId);
    return { success: true, data };
  }

  @Get('conversations')
  async listConversations(@CurrentUser() user: { id: string }) {
    const data = await this.tutorService.listConversations(user.id);
    return { success: true, data };
  }

  @Get('conversations/:id')
  async getConversation(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const data = await this.tutorService.getConversation(user.id, id);
    return { success: true, data };
  }

  @Post('landing-copy')
  async generateLandingCopy(@Body() dto: GenerateLandingCopyDto) {
    const data = await this.aiService.generateLandingCopy(dto);
    return { success: true, data };
  }

  @Post('email-campaign')
  async generateEmailCampaign(@Body() dto: { goal: string; audience?: string; product?: string; tone?: string }) {
    const data = await this.aiService.generateEmailCampaign(dto);
    return { success: true, data };
  }

  @Post('assignment-feedback')
  async assignmentFeedback(@Body() dto: AssignmentFeedbackDto) {
    const data = await this.aiService.generateAssignmentFeedback(dto);
    return { success: true, data };
  }

  @Post('suggest-improvements')
  async suggestImprovements(@CurrentUser() user: { id: string }, @Body() dto: SuggestImprovementsDto) {
    const data = await this.aiService.suggestCourseImprovements(user.id, dto.courseId);
    return { success: true, data };
  }

  @Post('embed-course')
  async embedCourse(@CurrentUser() user: { id: string; role: string }, @Body() dto: { courseId: string }) {
    const data = await this.tutorService.embedCourse(user.id, user.role, dto.courseId);
    return { success: true, data };
  }
}
