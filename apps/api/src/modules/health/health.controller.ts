import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { getMissingProductionEnv } from '../../config/env.validation';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  async health() {
    let database: 'connected' | 'unavailable' = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'unavailable';
    }

    const redisHost = this.configService.get<string>('redis.host');
    const redisPort = this.configService.get<number>('redis.port');
    const stripeSecret = this.configService.get<string>('stripe.secretKey');
    const razorpayKeyId = this.configService.get<string>('razorpay.keyId');
    const razorpayKeySecret = this.configService.get<string>('razorpay.keySecret');
    const s3Bucket = this.configService.get<string>('storage.bucket');
    const s3AccessKey = this.configService.get<string>('storage.accessKey');
    const s3SecretKey = this.configService.get<string>('storage.secretKey');
    const resendKey = this.configService.get<string>('email.resendApiKey');
    const openaiKey = this.configService.get<string>('ai.openaiApiKey');
    const geminiKey = this.configService.get<string>('ai.geminiApiKey');
    const anthropicKey = this.configService.get<string>('ai.anthropicApiKey');
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabasePublishableKey = this.configService.get<string>('supabase.publishableKey');
    const appEnv = this.configService.get<string>('app.env') ?? 'development';
    const productionMissing = getMissingProductionEnv(process.env);

    return {
      status: database === 'connected' && (appEnv !== 'production' || productionMissing.length === 0) ? 'ok' : 'degraded',
      database,
      redisConfigured: Boolean(redisHost && redisPort),
      queuesConfigured: Boolean(redisHost && redisPort),
      providers: {
        stripeConfigured: Boolean(stripeSecret),
        razorpayConfigured: Boolean(razorpayKeyId && razorpayKeySecret),
        s3Configured: Boolean(s3Bucket && s3AccessKey && s3SecretKey),
        resendConfigured: Boolean(resendKey),
        aiConfigured: Boolean(openaiKey || geminiKey || anthropicKey),
        supabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
      },
      productionReady: appEnv === 'production' ? productionMissing.length === 0 : false,
      missingProductionEnv: appEnv === 'production' ? productionMissing : [],
      checkedAt: new Date().toISOString(),
    };
  }
}
