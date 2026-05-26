import { z } from 'zod';

const productionSecretPlaceholder = /^change-me-in-production/;

const envSchema = z.object({
  APP_ENV: z.string().optional(),
  APP_PORT: z.coerce.number().int().positive().optional(),
  APP_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().positive().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().optional(),
  JWT_REFRESH_EXPIRY: z.string().optional(),
  AUTH_TOKEN_PEPPER: z.string().optional(),
  REQUIRE_EMAIL_VERIFICATION: z.enum(['true', 'false']).optional(),
  SUPABASE_URL: z.string().url().or(z.literal('')).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_JWT_ISSUER: z.string().url().or(z.literal('')).optional(),
  SUPABASE_JWKS_URL: z.string().url().or(z.literal('')).optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  S3_ENDPOINT: z.string().url().or(z.literal('')).optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().int().positive().optional(),
  THROTTLE_LIMIT: z.coerce.number().int().positive().optional(),
});

const productionRequiredKeys = [
  'DATABASE_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'AUTH_TOKEN_PEPPER',
  'APP_URL',
  'FRONTEND_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_JWT_ISSUER',
  'SUPABASE_JWKS_URL',
  'SUPABASE_JWT_AUDIENCE',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET',
  'S3_REGION',
] as const;

function isBlank(value: unknown) {
  if (typeof value === 'number') return !Number.isFinite(value);
  return typeof value !== 'string' || value.trim().length === 0;
}

function usesPlaceholderSecret(value: unknown) {
  return typeof value === 'string' && productionSecretPlaceholder.test(value);
}

export function getMissingProductionEnv(config: Record<string, unknown>) {
  const missing: string[] = productionRequiredKeys.filter((key) => isBlank(config[key]));
  const placeholderSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'AUTH_TOKEN_PEPPER'].filter((key) =>
    usesPlaceholderSecret(config[key]),
  );
  const hasPaymentProvider =
    Boolean(config.STRIPE_SECRET_KEY && config.STRIPE_WEBHOOK_SECRET) ||
    Boolean(config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET && config.RAZORPAY_WEBHOOK_SECRET);
  const hasAiProvider = Boolean(config.OPENAI_API_KEY || config.GEMINI_API_KEY || config.ANTHROPIC_API_KEY);

  if (!hasPaymentProvider) missing.push('STRIPE_* or RAZORPAY_* provider credentials');
  if (!hasAiProvider) missing.push('OPENAI_API_KEY or GEMINI_API_KEY or ANTHROPIC_API_KEY');

  return [...new Set([...missing, ...placeholderSecrets])];
}

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${messages.join('; ')}`);
  }

  if (parsed.data.APP_ENV === 'production') {
    const missing = getMissingProductionEnv(parsed.data);
    if (missing.length) {
      throw new Error(`Missing production environment configuration: ${missing.join(', ')}`);
    }
  }

  return parsed.data;
}
