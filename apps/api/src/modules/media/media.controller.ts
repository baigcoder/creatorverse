import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { CompleteUploadDto, UploadPolicyDto } from './media.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  list(
    @CurrentUser() user: { id: string; role: string },
    @Query('folder') folder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mediaService.list(user.id, user.role, {
      folder,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('upload-policy')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  createUploadPolicy(@CurrentUser() user: { id: string }, @Body() dto: UploadPolicyDto) {
    return this.mediaService.createUploadPolicy(user.id, dto);
  }

  @Post('complete-upload')
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  completeUpload(@CurrentUser() user: { id: string }, @Body() dto: CompleteUploadDto) {
    return this.mediaService.completeUpload(user.id, dto);
  }

  @Get('signed-url')
  signedUrl(@Query('key') key: string, @CurrentUser() user: { id: string; role: string }) {
    return this.mediaService.signedUrl(key, user.id, user.role);
  }
}
