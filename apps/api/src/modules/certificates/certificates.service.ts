import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generate(userId: string, dto: any) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: { course: true },
    });
    if (!enrollment || enrollment.userId !== userId) throw new NotFoundException('Enrollment not found');

    const certificate = await this.prisma.certificate.upsert({
      where: { enrollmentId: enrollment.id },
      update: { templateId: dto.templateId },
      create: {
        userId,
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id,
        templateId: dto.templateId,
      },
    });

    const certificateUrl = dto.certificateUrl ?? this.renderUrl(certificate.id);
    return this.prisma.certificate.update({
      where: { id: certificate.id },
      data: { certificateUrl },
    });
  }

  async findById(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    return certificate;
  }

  verify(id: string) {
    return this.findById(id);
  }

  async renderPdf(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, creator: { select: { brandName: true } } } },
      },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');

    return new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F8FAFC');
      doc.roundedRect(36, 36, doc.page.width - 72, doc.page.height - 72, 18).lineWidth(2).stroke('#FF9F1C');
      doc.fillColor('#0B1020').fontSize(22).font('Helvetica-Bold').text('SkillMango AI', 0, 86, { align: 'center' });
      doc.fillColor('#64748B').fontSize(13).font('Helvetica').text('Certificate of Completion', 0, 124, { align: 'center' });
      doc.fillColor('#0B1020').fontSize(34).font('Helvetica-Bold').text(certificate.user.name, 0, 190, { align: 'center' });
      doc.fillColor('#64748B').fontSize(15).font('Helvetica').text('has successfully completed', 0, 244, { align: 'center' });
      doc.fillColor('#7C3AED').fontSize(28).font('Helvetica-Bold').text(certificate.course.title, 90, 280, { align: 'center', width: doc.page.width - 180 });
      doc.fillColor('#64748B').fontSize(13).font('Helvetica').text(`Issued by ${certificate.course.creator.brandName}`, 0, 350, { align: 'center' });
      doc.fillColor('#0B1020').fontSize(10).text(`Certificate ID: ${certificate.id}`, 0, 430, { align: 'center' });
      doc.fillColor('#94A3B8').fontSize(10).text(`Issued: ${certificate.issuedAt.toDateString()}`, 0, 448, { align: 'center' });
      doc.end();
    });
  }

  createTemplate(userId: string, dto: any) {
    return this.prisma.certificateTemplate.create({
      data: {
        creatorId: dto.creatorId ?? userId,
        name: dto.name,
        design: dto.design ?? {},
      },
    });
  }

  templates(creatorId?: string) {
    return this.prisma.certificateTemplate.findMany({ where: { creatorId }, orderBy: { createdAt: 'desc' } });
  }

  private renderUrl(certificateId: string) {
    const appUrl = this.configService.get<string>('app.url') || 'http://localhost:4000';
    return `${appUrl}/api/v1/certificates/${certificateId}/render`;
  }
}
