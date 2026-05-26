import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { AssignmentsController } from './assignments.controller';
import { CoursesService } from './courses.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CoursesController, AssignmentsController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
