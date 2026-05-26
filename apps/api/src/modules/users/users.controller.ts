import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: { id: string }) {
    const data = await this.usersService.findById(user.id);
    return { success: true, data };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(user.id, dto);
    return { success: true, data };
  }
}