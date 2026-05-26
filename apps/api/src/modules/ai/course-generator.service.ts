import { Injectable } from '@nestjs/common';
import { AIProviderFactory } from './providers/ai-provider.factory';

@Injectable()
export class CourseGeneratorService {
  constructor(private providerFactory: AIProviderFactory) {}

  async generateOutline(input: { topic: string; audience?: string; level?: string; duration?: string; goal?: string; tone?: string }) {
    const provider = this.providerFactory.getProvider('openai');
    return provider.generateJSON(
      `Generate a comprehensive course outline for:
Topic: ${input.topic}
Audience: ${input.audience || 'General learners'}
Level: ${input.level || 'BEGINNER'}
Duration: ${input.duration || '4 weeks'}

Return JSON: { title, description, sections: [{ title, lessons: [{ title, type, duration }] }] }`,
      { temperature: 0.7, systemPrompt: 'You are an expert course designer. Generate well-structured course outlines. Return valid JSON only.' },
    );
  }
}