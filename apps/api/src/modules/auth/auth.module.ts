import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret') || 'change-me-in-production-access-secret',
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiry') || '15m',
        } as any,
      }),
    }),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthService, JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard, CsrfGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard, CsrfGuard],
})
export class AuthModule {}
