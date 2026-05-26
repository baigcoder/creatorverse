import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatorsService } from './creators.service';
import { CreateCreatorDto, UpdateCreatorDto } from './creators.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('LEARNER', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCreatorDto) {
    return this.creatorsService.create(user.id, dto);
  }

  @Get(':id')
  @Public()
  findById(@Param('id') id: string) {
    return this.creatorsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: UpdateCreatorDto) {
    return this.creatorsService.update(id, user.id, dto);
  }

  @Get(':id/courses')
  @Public()
  courses(@Param('id') id: string) {
    return this.creatorsService.courses(id);
  }

  @Get(':id/stats')
  @Public()
  stats(@Param('id') id: string) {
    return this.creatorsService.stats(id);
  }
}
