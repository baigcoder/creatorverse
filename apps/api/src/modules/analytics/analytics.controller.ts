import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, TrackEventDto } from './analytics.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('creator-overview')
  creatorOverview(@CurrentUser() user: { id: string }) {
    return this.analyticsService.creatorOverview(user.id);
  }

  @Get('course/:id')
  course(@Param('id') id: string) {
    return this.analyticsService.course(id);
  }

  @Get('funnel')
  funnel(@CurrentUser() user: { id: string }, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.funnel(user.id, query);
  }

  @Get('community')
  community(@CurrentUser() user: { id: string }) {
    return this.analyticsService.community(user.id);
  }

  @Post('events')
  @Roles('LEARNER', 'CREATOR', 'AFFILIATE', 'ADMIN', 'SUPER_ADMIN')
  trackEvent(@CurrentUser() user: { id: string }, @Body() dto: TrackEventDto) {
    return this.analyticsService.trackEvent(user.id, dto);
  }
}
