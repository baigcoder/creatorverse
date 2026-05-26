import { OrderType } from '@/services/payments';

export function normalizeCheckoutType(type: string): OrderType {
  const value = type.toUpperCase();
  if (value === 'PLAN') return 'MEMBERSHIP';
  if (value === 'COURSE' || value === 'WORKSHOP' || value === 'MEMBERSHIP' || value === 'PRODUCT') return value;
  return 'COURSE';
}
