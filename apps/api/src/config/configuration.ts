export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT || '4000', 10),
    env: process.env.APP_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://skillmango:skillmango@localhost:5432/skillmango?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-in-production-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  auth: {
    tokenPepper: process.env.AUTH_TOKEN_PEPPER || process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh-secret',
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtIssuer: process.env.SUPABASE_JWT_ISSUER || (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1` : ''),
    jwksUrl: process.env.SUPABASE_JWKS_URL || (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json` : ''),
    jwtAudience: process.env.SUPABASE_JWT_AUDIENCE || 'authenticated',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@skillmango.ai',
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || '',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
});
