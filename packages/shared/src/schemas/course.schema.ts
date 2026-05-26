import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  price: z.number().min(0, 'Price must be 0 or greater').default(0),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('USD'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  language: z.string().default('en'),
  thumbnailUrl: z.string().url().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  language: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const createSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required').max(200),
  order: z.number().int().min(0).optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderSectionsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required').max(300),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).default('VIDEO'),
  videoUrl: z.string().url().optional(),
  content: z.any().optional(),
  isPreview: z.boolean().default(false),
  duration: z.number().int().min(0).default(0),
  dripAfterDays: z.number().int().min(0).optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).optional(),
  videoUrl: z.string().url().optional(),
  content: z.any().optional(),
  isPreview: z.boolean().optional(),
  duration: z.number().int().min(0).optional(),
  dripAfterDays: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderLessonsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;