import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateLessonDto,
  UpdateLessonDto,
  ReorderDto,
  EnrollDto,
  SubmitAssignmentDto,
  GradeAssignmentDto,
  SubmitQuizDto,
  UpsertManagedAssignmentDto,
  UpsertManagedQuizDto,
} from './courses.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.coursesService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      status: status as any,
      level: level as any,
      search,
    });
    return { success: true, data: data.data, meta: data.meta };
  }

  @Get('my-learning')
  @UseGuards(JwtAuthGuard)
  async myLearning(@CurrentUser() user: { id: string }) {
    const data = await this.coursesService.findMyLearning(user.id);
    return { success: true, data };
  }

  @Get('my-learning/:id')
  @UseGuards(JwtAuthGuard)
  async myLearningCourse(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const data = await this.coursesService.findLearningCourse(id, user.id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async create(@CurrentUser() user: { id: string; role: string }, @Body() dto: CreateCourseDto) {
    const data = await this.coursesService.create(user.id, dto);
    return { success: true, data };
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.coursesService.findBySlug(slug);
    return { success: true, data };
  }

  @Get('manage/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async findManaged(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.findManagedById(id, user.id, user.role);
    return { success: true, data };
  }

  @Get('manage/:id/curriculum')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async getManagedCurriculum(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.getManagedCurriculum(id, user.id, user.role);
    return { success: true, data };
  }

  @Get('quizzes/:quizId')
  @UseGuards(JwtAuthGuard)
  async getQuiz(@Param('quizId') quizId: string, @CurrentUser() user: { id: string }) {
    const data = await this.coursesService.findQuizForLearner(quizId, user.id);
    return { success: true, data };
  }

  @Post('quizzes/:quizId/submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @Param('quizId') quizId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitQuizDto,
  ) {
    const data = await this.coursesService.submitQuiz(quizId, user.id, dto.answers);
    return { success: true, data };
  }

  @Get('assignments/:assignmentId')
  @UseGuards(JwtAuthGuard)
  async getAssignment(@Param('assignmentId') assignmentId: string, @CurrentUser() user: { id: string }) {
    const data = await this.coursesService.findAssignmentForLearner(assignmentId, user.id);
    return { success: true, data };
  }

  @Delete('quizzes/manage/:quizId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async deleteManagedQuiz(@Param('quizId') quizId: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.deleteManagedQuiz(quizId, user.id, user.role);
    return { success: true, data };
  }

  @Delete('assignments/manage/:assignmentId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async deleteManagedAssignment(@Param('assignmentId') assignmentId: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.deleteManagedAssignment(assignmentId, user.id, user.role);
    return { success: true, data };
  }

  @Post('assignments/:assignmentId/submit')
  @UseGuards(JwtAuthGuard)
  async submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitAssignmentDto,
  ) {
    const data = await this.coursesService.submitAssignment(assignmentId, user.id, dto);
    return { success: true, data };
  }

  @Post('assignments/:submissionId/grade')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async gradeAssignment(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: GradeAssignmentDto,
  ) {
    const data = await this.coursesService.gradeAssignmentSubmission(submissionId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const data = await this.coursesService.findPublicById(id);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateCourseDto,
  ) {
    const data = await this.coursesService.update(id, user.id, user.role, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    await this.coursesService.remove(id, user.id, user.role);
    return { success: true, message: 'Course deleted' };
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async publish(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.publish(id, user.id);
    return { success: true, data };
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: EnrollDto,
  ) {
    const data = await this.coursesService.enroll(id, user.id, dto.couponCode);
    return { success: true, data };
  }

  @Get(':id/curriculum')
  @Public()
  async getCurriculum(@Param('id') id: string) {
    const data = await this.coursesService.getCurriculum(id);
    return { success: true, data };
  }

  // Sections
  @Post(':courseId/sections')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async createSection(
    @Param('courseId') courseId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateSectionDto,
  ) {
    const data = await this.coursesService.createSection(courseId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Patch('sections/reorder')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async reorderSections(
    @Body() dto: ReorderDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    await this.coursesService.reorderSections(dto.items, user.id, user.role);
    return { success: true };
  }

  @Patch('sections/:sectionId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async updateSection(
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateSectionDto,
  ) {
    const data = await this.coursesService.updateSection(sectionId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Delete('sections/:sectionId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async deleteSection(@Param('sectionId') sectionId: string, @CurrentUser() user: { id: string; role: string }) {
    await this.coursesService.deleteSection(sectionId, user.id, user.role);
    return { success: true, message: 'Section deleted' };
  }

  // Lessons
  @Post('sections/:sectionId/lessons')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async createLesson(
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateLessonDto,
  ) {
    const data = await this.coursesService.createLesson(sectionId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Patch('lessons/reorder')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async reorderLessons(@Body() dto: ReorderDto, @CurrentUser() user: { id: string; role: string }) {
    await this.coursesService.reorderLessons(dto.items, user.id, user.role);
    return { success: true };
  }

  @Patch('lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateLessonDto,
  ) {
    const data = await this.coursesService.updateLesson(lessonId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Get('lessons/:lessonId/assessment')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async getManagedLessonAssessment(@Param('lessonId') lessonId: string, @CurrentUser() user: { id: string; role: string }) {
    const data = await this.coursesService.getManagedLessonAssessment(lessonId, user.id, user.role);
    return { success: true, data };
  }

  @Patch('lessons/:lessonId/quiz')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async upsertManagedQuiz(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpsertManagedQuizDto,
  ) {
    const data = await this.coursesService.upsertManagedQuiz(lessonId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Patch('lessons/:lessonId/assignment')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async upsertManagedAssignment(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpsertManagedAssignmentDto,
  ) {
    const data = await this.coursesService.upsertManagedAssignment(lessonId, user.id, user.role, dto);
    return { success: true, data };
  }

  @Delete('lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async deleteLesson(@Param('lessonId') lessonId: string, @CurrentUser() user: { id: string; role: string }) {
    await this.coursesService.deleteLesson(lessonId, user.id, user.role);
    return { success: true, message: 'Lesson deleted' };
  }

  @Post('lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  async markProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { completed: boolean; watchTimeSeconds?: number },
  ) {
    const data = await this.coursesService.markLessonProgress(lessonId, user.id, body);
    return { success: true, data };
  }
}
