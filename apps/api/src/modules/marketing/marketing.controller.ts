import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';
import { MarketingService } from './marketing.service';

@Controller('marketing/campaigns')
@UseGuards(JwtAuthGuard)
@Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.marketingService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCampaignDto) {
    return this.marketingService.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: UpdateCampaignDto) {
    return this.marketingService.update(id, user.id, dto);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.marketingService.send(id, user.id);
  }
}
