import { describe, expect, it } from 'vitest';
import { normalizeCheckoutType } from './checkout';

describe('normalizeCheckoutType', () => {
  it.each([
    ['course', 'COURSE'],
    ['WORKSHOP', 'WORKSHOP'],
    ['membership', 'MEMBERSHIP'],
    ['product', 'PRODUCT'],
    ['plan', 'MEMBERSHIP'],
    ['unknown', 'COURSE'],
  ] as const)('maps %s to %s', (input, expected) => {
    expect(normalizeCheckoutType(input)).toBe(expected);
  });
});
