import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './email.processor';
import { CertificateProcessor } from './certificate.processor';
import { AnalyticsProcessor } from './analytics.processor';
import { AiProcessor } from './ai.processor';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host') || 'localhost',
          port: configService.get('redis.port') || 6379,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'certificate' },
      { name: 'analytics' },
      { name: 'ai' },
    ),
  ],
  providers: [EmailProcessor, CertificateProcessor, AnalyticsProcessor, AiProcessor],
  exports: [BullModule],
})
export class QueuesModule {}