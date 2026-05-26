import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateWorkshopDto, UpdateWorkshopDto } from './workshops.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.workshopsService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      status,
    });
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.workshopsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.workshopsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async create(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateWorkshopDto,
  ) {
    return this.workshopsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateWorkshopDto,
  ) {
    return this.workshopsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    await this.workshopsService.remove(id, user.id, user.role);
    return { success: true, message: 'Workshop deleted' };
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.workshopsService.register(id, user.id);
  }

  @Post(':id/attendance')
  @UseGuards(JwtAuthGuard)
  async markAttendance(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { attended: boolean; attendanceMinutes?: number },
  ) {
    return this.workshopsService.markAttendance(id, user.id, body);
  }
}
