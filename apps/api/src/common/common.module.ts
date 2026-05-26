import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GatewayModule } from '../gateway/gateway.module';
import { EmailService } from './services/email.service';
import { GamificationTriggerService } from './services/gamification-trigger.service';
import { AnalyticsEventService } from './services/analytics-event.service';
import { NotificationDispatcher } from './services/notification-dispatcher.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' }), GatewayModule],
  providers: [EmailService, GamificationTriggerService, AnalyticsEventService, NotificationDispatcher],
  exports: [EmailService, GamificationTriggerService, AnalyticsEventService, NotificationDispatcher, GatewayModule],
})
export class CommonModule {}
