import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface AiJobData {
  type: 'embed_course' | 'generate_content';
  payload: Record<string, any>;
}

@Processor('ai')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<AiJobData>) {
    this.logger.log(`Processing AI job ${job.id} (${job.data.type})`);

    if (job.data.type === 'embed_course') {
      const { courseId } = job.data.payload;
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { sections: { include: { lessons: true }, orderBy: { order: 'asc' } } },
      });

      if (!course) {
        this.logger.warn(`Course ${courseId} not found for embedding`);
        return { embedded: false, reason: 'course_not_found' };
      }

      await this.prisma.knowledgeDocument.deleteMany({ where: { courseId } });

      let chunkIndex = 0;
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          if (lesson.content && typeof lesson.content === 'string') {
            const chunks = this.chunkText(lesson.content, 500, 100);
            for (const chunk of chunks) {
              await this.prisma.knowledgeDocument.create({
                data: { courseId, sourceType: 'LESSON', sourceId: lesson.id, content: chunk, chunkIndex, embeddingStatus: 'PENDING' },
              });
              chunkIndex++;
            }
          }
        }
      }

      this.logger.log(`Embedded course ${courseId}: ${chunkIndex} chunks created`);
      return { embedded: true, courseId, chunkCount: chunkIndex };
    }

    return { unknown: true };
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      start += chunkSize - overlap;
      if (start >= words.length) break;
    }
    return chunks.filter((c) => c.length > 0);
  }
}
