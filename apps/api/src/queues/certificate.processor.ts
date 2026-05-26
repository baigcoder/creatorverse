import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CertificateJobData {
  userId: string;
  courseId: string;
  enrollmentId: string;
  templateId?: string;
  userName: string;
  courseTitle: string;
  creatorName: string;
}

@Processor('certificate')
export class CertificateProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificateProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<CertificateJobData>) {
    this.logger.log(`Processing certificate job ${job.id} for enrollment ${job.data.enrollmentId}`);

    const { userId, courseId, enrollmentId, userName, courseTitle, creatorName } = job.data;
    const certificateId = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const certificateUrl = `${process.env.APP_URL || 'http://localhost:4000'}/api/v1/certificates/${certificateId}/render`;

    const certificate = await this.prisma.certificate.upsert({
      where: { enrollmentId },
      update: { certificateUrl },
      create: {
        id: certificateId,
        userId,
        courseId,
        enrollmentId,
        certificateUrl,
      },
    });

    this.logger.log(`Certificate generated: ${certificate.id}`);
    return { certificateId: certificate.id, certificateUrl };
  }
}
