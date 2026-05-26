import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto, UpdateMembershipDto } from './memberships.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('memberships')
  @Public()
  findAll(@Query('creatorId') creatorId?: string) {
    return this.membershipsService.findAll(creatorId);
  }

  @Get('memberships/:id')
  @Public()
  findById(@Param('id') id: string) {
    return this.membershipsService.findById(id);
  }

  @Post('memberships')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(user.id, dto);
  }

  @Patch('memberships/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }, @Body() dto: UpdateMembershipDto) {
    return this.membershipsService.update(id, user.id, user.role, dto);
  }

  @Post('memberships/:id/subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.membershipsService.subscribe(id, user.id);
  }

  @Delete('subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.membershipsService.cancel(id, user.id, user.role);
  }
}
