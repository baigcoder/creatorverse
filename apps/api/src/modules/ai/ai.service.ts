import { Injectable } from '@nestjs/common';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private providerFactory: AIProviderFactory,
    private prisma: PrismaService,
  ) {}

  async generateCourseOutline(dto: any) {
    const provider = this.providerFactory.getProvider();
    const prompt = `Generate a comprehensive course outline for the following:
Topic: ${dto.topic}
Audience: ${dto.audience || 'General learners'}
Level: ${dto.level || 'BEGINNER'}
Duration: ${dto.duration || '4 weeks'}
Goal: ${dto.goal || 'Learn the fundamentals'}

Return a JSON object with:
- title: course title
- description: course description
- learningOutcomes: array of learning outcomes
- sections: array of { title, lessons: [{ title, type, duration }] }
- suggestedQuizzes: array of quiz topic suggestions
- suggestedAssignments: array of assignment topic suggestions`;

    const result = await provider.generateJSON(prompt, {
      temperature: 0.7,
      systemPrompt: 'You are an expert course designer. Generate comprehensive, well-structured course outlines. Always respond with valid JSON.',
    });

    await this.prisma.aIGeneration.create({
      data: {
        userId: dto.userId || 'system',
        type: 'course_outline',
        input: dto,
        output: result as any,
        model: 'gpt-4o-mini',
      },
    });

    return result;
  }

  async generateLessonScript(dto: any) {
    const provider = this.providerFactory.getProvider();
    const prompt = `Write a detailed lesson script/content for:
Title: ${dto.title}
Topic: ${dto.topic}
Level: ${dto.level || 'BEGINNER'}
Duration: ${dto.duration || '10 minutes'}

Return a JSON object with:
- title: lesson title
- content: detailed lesson content (markdown)
- keyTakeaways: array of key takeaways
- suggestedQuestions: array of discussion questions`;

    return provider.generateJSON(prompt, {
      temperature: 0.7,
      systemPrompt: 'You are an expert educator. Write engaging, clear lesson content. Always respond with valid JSON.',
    });
  }

  async generateLandingCopy(dto: any) {
    const provider = this.providerFactory.getProvider();
    const prompt = `Generate landing page copy for a course:
Title: ${dto.courseTitle}
Description: ${dto.courseDescription || ''}
Target Audience: ${dto.targetAudience || 'Anyone interested'}
Tone: ${dto.tone || 'Professional and engaging'}

Return a JSON object with:
- headline: compelling headline
- subheadline: supporting subheadline
- features: array of { icon, title, description }
- testimonials: array of placeholder testimonials
- faq: array of { question, answer }
- ctaText: call-to-action button text`;

    return provider.generateJSON(prompt, {
      temperature: 0.8,
      systemPrompt: 'You are an expert copywriter for online courses. Write compelling, conversion-focused landing page copy. Always respond with valid JSON.',
    });
  }

  async generateEmailCampaign(dto: any) {
    const provider = this.providerFactory.getProvider();
    const prompt = `Generate an email campaign for:
Goal: ${dto.goal}
Audience: ${dto.audience || 'Course students'}
Course/Product: ${dto.product || 'Online course'}
Tone: ${dto.tone || 'Professional'}

Return a JSON object with:
- subject: email subject line
- previewText: preview text
- body: email body (HTML)
- ctaText: call-to-action text`;

    return provider.generateJSON(prompt, {
      temperature: 0.7,
      systemPrompt: 'You are an expert email marketer. Write high-converting email campaigns. Always respond with valid JSON.',
    });
  }

  async generateAssignmentFeedback(dto: { assignmentInstructions: string; submission: string; rubric?: string }) {
    const provider = this.providerFactory.getProvider();
    const prompt = `Review this learner assignment submission.

Assignment instructions:
${dto.assignmentInstructions}

Rubric:
${dto.rubric || 'Clarity, correctness, completeness, and practical application.'}

Submission:
${dto.submission}

Return a JSON object with:
- scoreSuggestion: number from 0 to 100
- strengths: array of strengths
- improvements: array of actionable improvements
- instructorFeedback: concise feedback written to the learner
- nextSteps: array of suggested learning actions`;

    return provider.generateJSON(prompt, {
      temperature: 0.35,
      systemPrompt: 'You are a fair teaching assistant. Be specific, constructive, and do not invent facts beyond the submitted work. Always respond with valid JSON.',
    });
  }

  async suggestCourseImprovements(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: true,
        sections: { include: { lessons: true } },
        analytics: { orderBy: { date: 'desc' }, take: 14 },
        enrollments: { select: { progress: true, status: true } },
      },
    });
    if (!course) return { recommendations: [], reason: 'course_not_found' };
    if (course.creator.userId !== userId) return { recommendations: [], reason: 'forbidden' };

    const provider = this.providerFactory.getProvider();
    const prompt = `Analyze this course and suggest improvements.

Course: ${course.title}
Description: ${course.description || ''}
Sections: ${course.sections.length}
Lessons: ${course.sections.reduce((sum, section) => sum + section.lessons.length, 0)}
Enrollments: ${course.enrollments.length}
Average progress: ${
      course.enrollments.length
        ? Math.round(course.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / course.enrollments.length)
        : 0
    }%
Recent analytics: ${JSON.stringify(course.analytics)}

Return a JSON object with:
- priority: high | medium | low
- recommendations: array of { area, issue, action, expectedImpact }
- suggestedCampaign: { subject, angle }
- pricingNote: concise pricing/positioning suggestion`;

    return provider.generateJSON(prompt, {
      temperature: 0.45,
      systemPrompt: 'You are a SaaS learning-business analyst. Use only the supplied data and be practical. Always respond with valid JSON.',
    });
  }
}
