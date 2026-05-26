import { Injectable } from '@nestjs/common';
import { AIProviderFactory } from './providers/ai-provider.factory';

@Injectable()
export class QuizGeneratorService {
  constructor(private providerFactory: AIProviderFactory) {}

  async generateQuiz(input: { content: string; questionType?: string; questionCount?: number; difficulty?: string }) {
    const provider = this.providerFactory.getProvider('openai');
    return provider.generateJSON(
      `Generate a quiz based on this content:
${input.content}

Question type: ${input.questionType || 'MCQ'}
Number of questions: ${input.questionCount || 5}
Difficulty: ${input.difficulty || 'INTERMEDIATE'}

Return JSON: { title, difficulty, questionType, metadata: { sourceLength, questionCount }, questions: [{ questionText, type, options, correctAnswer, explanation, points }] }`,
      { temperature: 0.3, systemPrompt: 'You are a quiz generation expert. Create accurate, relevant quizzes from the given content. Return valid JSON only.' },
    );
  }
}
