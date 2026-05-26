import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto, PayoutAffiliateDto } from './affiliates.dto';

@Controller('affiliates')
@UseGuards(JwtAuthGuard)
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateAffiliateDto) {
    return this.affiliatesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.affiliatesService.findAll(user.id);
  }

  @Get(':id/earnings')
  earnings(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.affiliatesService.earnings(id, user.id);
  }

  @Post(':id/payout')
  payout(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: PayoutAffiliateDto) {
    return this.affiliatesService.payout(id, user.id, dto);
  }
}
