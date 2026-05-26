import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateCommunityDto,
  CreateRoomDto,
  CreatePostDto,
  CreateCommentDto,
  CreateReactionDto,
  CreatePollDto,
} from './community.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @Public()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.communityService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get('discover')
  @UseGuards(JwtAuthGuard)
  async discover(
    @CurrentUser() user: { id: string; role: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.discover(user.id, user.role, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get('access/:id')
  @UseGuards(JwtAuthGuard)
  async findAccessible(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.communityService.findAccessibleById(id, user.id, user.role);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.communityService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateCommunityDto) {
    return this.communityService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() body: { name?: string; description?: string; visibility?: string },
  ) {
    return this.communityService.update(id, user.id, user.role, body);
  }

  // Rooms
  @Post(':communityId/rooms')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  async createRoom(
    @Param('communityId') communityId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateRoomDto,
  ) {
    return this.communityService.createRoom(communityId, user.id, user.role, dto);
  }

  @Get(':communityId/rooms')
  @UseGuards(JwtAuthGuard)
  async getRooms(@Param('communityId') communityId: string, @CurrentUser() user: { id: string; role: string }) {
    return this.communityService.getRooms(communityId, user.id, user.role);
  }

  // Posts
  @Post('rooms/:roomId/posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Param('roomId') roomId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.createPost(roomId, user.id, user.role, dto);
  }

  @Get('rooms/:roomId/posts')
  @UseGuards(JwtAuthGuard)
  async getPosts(
    @Param('roomId') roomId: string,
    @CurrentUser() user: { id: string; role: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getPosts(roomId, user.id, user.role, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  // Comments
  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.createComment(postId, user.id, user.role, dto);
  }

  // Reactions
  @Post('posts/:postId/reactions')
  @UseGuards(JwtAuthGuard)
  async createReaction(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateReactionDto,
  ) {
    return this.communityService.createReaction(postId, user.id, user.role, dto.type);
  }

  // Polls
  @Post('posts/:postId/poll')
  @UseGuards(JwtAuthGuard)
  async createPoll(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreatePollDto,
  ) {
    return this.communityService.createPoll(postId, user.id, user.role, dto);
  }

  @Post('polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  async votePoll(
    @Param('pollId') pollId: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() body: { option: string },
  ) {
    return this.communityService.votePoll(pollId, user.id, user.role, body.option);
  }
}
