import { Body, Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdminQueryDto, ModerateContentDto, UpdatePlatformSettingDto, UpdateUserStatusDto } from './admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  users(@Query() query: AdminQueryDto) {
    return this.adminService.users(query);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto, @CurrentUser() user: { id: string }) {
    return this.adminService.updateUserStatus(id, dto.status, user.id);
  }

  @Get('creators')
  creators() {
    return this.adminService.creators();
  }

  @Get('courses')
  courses(@Query() query: AdminQueryDto) {
    return this.adminService.courses(query);
  }

  @Get('payments')
  payments(@Query() query: AdminQueryDto) {
    return this.adminService.payments(query);
  }

  @Get('reports')
  reports(@Query() query: AdminQueryDto) {
    return this.adminService.reports(query);
  }

  @Get('moderation')
  moderation(@Query() query: AdminQueryDto) {
    return this.adminService.moderation(query);
  }

  @Get('logs')
  logs(@Query() query: AdminQueryDto) {
    return this.adminService.logs(query);
  }

  @Get('system-health')
  systemHealth() {
    return this.adminService.systemHealth();
  }

  @Patch('moderation/:id')
  moderate(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: ModerateContentDto) {
    return this.adminService.moderateContent(id, user.id, dto);
  }

  @Get('settings')
  settings() {
    return this.adminService.settings();
  }

  @Patch('settings')
  updateSetting(@CurrentUser() user: { id: string }, @Body() dto: UpdatePlatformSettingDto) {
    return this.adminService.updateSetting(user.id, dto);
  }
}
