import { describe, expect, it, vi } from 'vitest';
import { AiController } from './ai.controller';

describe('AiController', () => {
  it('routes quiz generation to the quiz generator service', async () => {
    const aiService = {};
    const tutorService = {};
    const quizGeneratorService = {
      generateQuiz: vi.fn().mockResolvedValue({
        title: 'Generated quiz',
        questions: [{ questionText: 'Question?', correctAnswer: 'Answer' }],
      }),
    };

    const controller = new AiController(aiService as never, tutorService as never, quizGeneratorService as never);
    const result = await controller.generateQuiz({ content: 'Lesson content', questionCount: 3 });

    expect(quizGeneratorService.generateQuiz).toHaveBeenCalledWith({ content: 'Lesson content', questionCount: 3 });
    expect(result.data).toEqual({
      title: 'Generated quiz',
      questions: [{ questionText: 'Question?', correctAnswer: 'Answer' }],
    });
  });
});
