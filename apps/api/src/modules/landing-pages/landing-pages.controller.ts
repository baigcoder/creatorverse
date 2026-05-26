import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LandingPagesService } from './landing-pages.service';
import { CreateLandingPageDto, UpdateLandingPageDto } from './landing-pages.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @Get('landing-pages')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: { id: string }) {
    return this.landingPagesService.findMine(user.id);
  }

  @Post('landing-pages')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateLandingPageDto) {
    return this.landingPagesService.create(user.id, dto);
  }

  @Patch('landing-pages/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: UpdateLandingPageDto) {
    return this.landingPagesService.update(id, user.id, dto);
  }

  @Post('landing-pages/:id/publish')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  publish(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.landingPagesService.publish(id, user.id);
  }

  @Delete('landing-pages/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  archive(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.landingPagesService.archive(id, user.id);
  }

  @Get('lp/:slug')
  @Public()
  viewBySlug(@Param('slug') slug: string) {
    return this.landingPagesService.findPublished(slug);
  }
}
