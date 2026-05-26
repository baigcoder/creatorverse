import { Body, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto, CreateTemplateDto } from './certificates.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('certificates/generate')
  @UseGuards(JwtAuthGuard)
  generate(@CurrentUser() user: { id: string }, @Body() dto: GenerateCertificateDto) {
    return this.certificatesService.generate(user.id, dto);
  }

  @Get('certificates/:id')
  @Public()
  findById(@Param('id') id: string) {
    return this.certificatesService.findById(id);
  }

  @Get('certificates/:id/verify')
  @Public()
  verify(@Param('id') id: string) {
    return this.certificatesService.verify(id);
  }

  @Get('certificates/:id/render')
  @Public()
  async render(@Param('id') id: string, @Res() response: Response) {
    const pdf = await this.certificatesService.renderPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="skillmango-certificate-${id}.pdf"`);
    response.send(pdf);
  }

  @Post('certificate-templates')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  createTemplate(@CurrentUser() user: { id: string }, @Body() dto: CreateTemplateDto) {
    return this.certificatesService.createTemplate(user.id, dto);
  }

  @Get('certificate-templates')
  @Public()
  templates(@Query('creatorId') creatorId?: string) {
    return this.certificatesService.templates(creatorId);
  }
}
