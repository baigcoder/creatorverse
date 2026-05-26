import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { GradeAssignmentDto } from './courses.dto';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post(':submissionId/grade')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async grade(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: GradeAssignmentDto,
  ) {
    const data = await this.coursesService.gradeAssignmentSubmission(submissionId, user.id, user.role, dto);
    return { success: true, data };
  }
}
