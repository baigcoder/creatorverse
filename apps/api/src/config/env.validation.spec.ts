import { describe, expect, it } from 'vitest';
import { getMissingProductionEnv, validateEnv } from './env.validation';

const productionEnv = {
  APP_ENV: 'production',
  APP_PORT: '4000',
  APP_URL: 'https://api.skillmango.test',
  FRONTEND_URL: 'https://app.skillmango.test',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/skillmango',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  JWT_ACCESS_SECRET: 'access-secret-with-enough-entropy',
  JWT_REFRESH_SECRET: 'refresh-secret-with-enough-entropy',
  AUTH_TOKEN_PEPPER: 'pepper-with-enough-entropy',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_xxx',
  SUPABASE_JWT_ISSUER: 'https://project.supabase.co/auth/v1',
  SUPABASE_JWKS_URL: 'https://project.supabase.co/auth/v1/.well-known/jwks.json',
  SUPABASE_JWT_AUDIENCE: 'authenticated',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  STRIPE_SECRET_KEY: 'sk_live_xxx',
  STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
  RESEND_API_KEY: 're_xxx',
  EMAIL_FROM: 'noreply@skillmango.test',
  S3_ACCESS_KEY: 'AKIA_TEST',
  S3_SECRET_KEY: 'secret',
  S3_BUCKET: 'skillmango-videos',
  S3_REGION: 'us-east-1',
  OPENAI_API_KEY: 'sk-openai',
};

describe('environment validation', () => {
  it('allows development with provider keys omitted', () => {
    expect(validateEnv({ APP_ENV: 'development', APP_PORT: '4000' })).toMatchObject({
      APP_ENV: 'development',
      APP_PORT: 4000,
    });
  });

  it('rejects production when required providers and secrets are missing', () => {
    expect(() =>
      validateEnv({
        APP_ENV: 'production',
        JWT_ACCESS_SECRET: 'change-me-in-production-access-secret',
        JWT_REFRESH_SECRET: 'change-me-in-production-refresh-secret',
      }),
    ).toThrow(/Missing production environment configuration/);
  });

  it('accepts production when all required operational providers are configured', () => {
    expect(validateEnv(productionEnv)).toMatchObject({
      APP_ENV: 'production',
      APP_PORT: 4000,
      REDIS_PORT: 6379,
    });
    expect(getMissingProductionEnv(productionEnv)).toEqual([]);
  });
});
