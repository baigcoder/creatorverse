import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TutorService {
  constructor(
    private providerFactory: AIProviderFactory,
    private prisma: PrismaService,
  ) {}

  async chat(userId: string, role: string, question: string, courseId?: string, conversationId?: string) {
    let context = '';
    let sources: Array<{ sourceType: string; sourceId: string | null; preview: string }> = [];

    if (courseId) {
      await this.assertCanUseCourseKnowledge(userId, role, courseId);
      const knowledgeDocs = await this.retrieveRelevantChunks(courseId, question);

      context = knowledgeDocs.map((doc) => doc.content).join('\n\n');
      sources = knowledgeDocs.map((doc) => ({
        sourceType: doc.sourceType,
        sourceId: doc.sourceId,
        preview: doc.content.slice(0, 180),
      }));
    }

    const provider = this.providerFactory.getProvider();
    const systemPrompt = `You are an AI tutor for an online learning platform. Your role is to help students understand course concepts.
${context ? `Use the following course content to answer questions:\n\n${context}\n\nAlways reference the specific lesson or section when answering.` : 'You do not have specific course content for this question.'}
If you cannot find the answer in the course content, clearly state: "I couldn't find this in the course content. Consider asking your instructor."
Be encouraging, clear, and provide examples when possible.`;

    const answer = await provider.generateText(question, {
      temperature: 0.4,
      systemPrompt,
      maxTokens: 1500,
    });

    const conversation = conversationId
      ? await this.prisma.aIConversation.findFirst({ where: { id: conversationId, userId } })
      : await this.prisma.aIConversation.create({
          data: {
            userId,
            courseId: courseId || undefined,
            type: 'TUTOR',
            messages: [],
          },
        });

    if (conversation) {
      const messages = (conversation.messages as Array<{ role: string; content: string }>) || [];
      messages.push({ role: 'user', content: question });
      messages.push({ role: 'assistant', content: answer });

      await this.prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { messages },
      });
    }

    return {
      answer,
      sources,
      conversationId: conversation?.id,
    };
  }

  async listConversations(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, courseId: true, type: true, messages: true, createdAt: true, updatedAt: true },
    });
  }

  async getConversation(userId: string, id: string) {
    const conversation = await this.prisma.aIConversation.findFirst({ where: { id, userId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async embedCourse(userId: string, role: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: true,
        sections: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    if (course.creator.userId !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('Only the creator can embed this course');
    }

    await this.prisma.knowledgeDocument.deleteMany({ where: { courseId } });

    const documents: Array<{ sourceType: string; sourceId?: string; content: string; chunkIndex: number; embeddingStatus: string }> = [];

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const lessonText = this.extractLessonText(lesson.content);
        const base = [`Course: ${course.title}`, `Section: ${section.title}`, `Lesson: ${lesson.title}`, lessonText].filter(Boolean).join('\n');
        const chunks = this.chunkText(base);
        chunks.forEach((content, chunkIndex) => {
          documents.push({
            sourceType: 'lesson',
            sourceId: lesson.id,
            content,
            chunkIndex,
            embeddingStatus: 'COMPLETED',
          });
        });
      }
    }

    if (documents.length > 0) {
      const provider = this.providerFactory.getProvider();
      for (const doc of documents) {
        const created = await this.prisma.knowledgeDocument.create({
          data: { ...doc, courseId, embeddingStatus: 'PENDING' },
        });

        try {
          const embedding = await provider.generateEmbedding(doc.content);
          if (embedding.length === 1536) {
            await this.prisma.$executeRawUnsafe(
              'UPDATE "knowledge_documents" SET "embedding" = $1::vector, "embeddingStatus" = $2 WHERE "id" = $3',
              `[${embedding.join(',')}]`,
              'COMPLETED',
              created.id,
            );
          } else {
            await this.prisma.knowledgeDocument.update({
              where: { id: created.id },
              data: { embeddingStatus: 'COMPLETED' },
            });
          }
        } catch {
          await this.prisma.knowledgeDocument.update({
            where: { id: created.id },
            data: { embeddingStatus: 'FAILED' },
          });
        }
      }
    }

    return {
      courseId,
      documents: documents.length,
      status: 'COMPLETED',
    };
  }

  private async retrieveRelevantChunks(courseId: string, question: string) {
    try {
      const provider = this.providerFactory.getProvider();
      const embedding = await provider.generateEmbedding(question);
      if (embedding.length === 1536) {
        const rows = await this.prisma.$queryRawUnsafe<Array<{ id: string; sourceType: string; sourceId: string | null; content: string; distance: number }>>(
          'SELECT "id", "sourceType", "sourceId", "content", ("embedding" <=> $1::vector) AS "distance" FROM "knowledge_documents" WHERE "courseId" = $2 AND "embeddingStatus" = $3 AND "embedding" IS NOT NULL ORDER BY "embedding" <=> $1::vector LIMIT 5',
          `[${embedding.join(',')}]`,
          courseId,
          'COMPLETED',
        );
        if (rows.length > 0) return rows;
      }
    } catch {
      // Fall back to lexical retrieval when embeddings are unavailable locally.
    }

    const docs = await this.prisma.knowledgeDocument.findMany({
      where: { courseId, embeddingStatus: 'COMPLETED' },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
    return docs
      .map((doc) => ({
        doc,
        score: terms.reduce((score, term) => score + (doc.content.toLowerCase().includes(term) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.doc);
  }

  private async assertCanUseCourseKnowledge(userId: string, role: string, courseId: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { creator: { select: { userId: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.creator.userId === userId) return;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { status: true },
    });
    if (enrollment && enrollment.status !== 'EXPIRED') return;

    throw new ForbiddenException('Enroll in this course before using its tutor knowledge.');
  }

  private extractLessonText(content: unknown) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'object') return JSON.stringify(content);
    return String(content);
  }

  private chunkText(text: string, maxLength = 1800) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];
    const chunks: string[] = [];
    for (let i = 0; i < normalized.length; i += maxLength) {
      chunks.push(normalized.slice(i, i + maxLength));
    }
    return chunks;
  }
}
