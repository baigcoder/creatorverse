import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GamificationService } from './gamification.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @Public()
  leaderboard() {
    return this.gamificationService.leaderboard();
  }

  @Get('badges')
  @Public()
  badges() {
    return this.gamificationService.badges();
  }

  @Get('achievements')
  @UseGuards(JwtAuthGuard)
  achievements(@CurrentUser() user: { id: string }) {
    return this.gamificationService.achievements(user.id);
  }

  @Get('streak')
  @UseGuards(JwtAuthGuard)
  streak(@CurrentUser() user: { id: string }) {
    return this.gamificationService.streak(user.id);
  }

  @Get('challenges')
  @Public()
  challenges() {
    return this.gamificationService.challenges();
  }

  @Post('challenges/:id/join')
  @UseGuards(JwtAuthGuard)
  joinChallenge(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.gamificationService.joinChallenge(id, user.id);
  }
}
