import 'reflect-metadata';
import { PATH_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CoursesController } from './courses.controller';

function routeIndex(routePath: string) {
  return Object.getOwnPropertyNames(CoursesController.prototype).findIndex((methodName) => {
    if (methodName === 'constructor') return false;
    const handler = CoursesController.prototype[methodName as keyof CoursesController];
    return Reflect.getMetadata(PATH_METADATA, handler) === routePath;
  });
}

describe('CoursesController route ordering', () => {
  it('registers reorder routes before dynamic section and lesson routes', () => {
    expect(routeIndex('sections/reorder')).toBeLessThan(routeIndex('sections/:sectionId'));
    expect(routeIndex('lessons/reorder')).toBeLessThan(routeIndex('lessons/:lessonId'));
  });
});
