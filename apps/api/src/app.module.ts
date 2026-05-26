import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CreatorsModule } from './modules/creators/creators.module';
import { CoursesModule } from './modules/courses/courses.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { CommunityModule } from './modules/community/community.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { QueuesModule } from './queues/queues.module';
import { LandingPagesModule } from './modules/landing-pages/landing-pages.module';
import { MediaModule } from './modules/media/media.module';
import { GatewayModule } from './gateway/gateway.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { CsrfGuard } from './modules/auth/guards/csrf.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local', '.env.production'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    CreatorsModule,
    CoursesModule,
    WorkshopsModule,
    CommunityModule,
    MembershipsModule,
    ProductsModule,
    PaymentsModule,
    CouponsModule,
    AffiliatesModule,
    CertificatesModule,
    AiModule,
    AnalyticsModule,
    NotificationsModule,
    GamificationModule,
    AdminModule,
    AuditModule,
    QueuesModule,
    LandingPagesModule,
    MediaModule,
    MarketingModule,
    HealthModule,
    GatewayModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
