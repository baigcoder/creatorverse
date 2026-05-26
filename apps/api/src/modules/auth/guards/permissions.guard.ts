import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['admin:*', 'user:read', 'creator:read', 'course:read', 'payment:read', 'moderation:*', 'audit:read'],
  CREATOR: [
    'course:*',
    'workshop:*',
    'community:*',
    'membership:*',
    'product:*',
    'coupon:*',
    'affiliate:*',
    'landing-page:*',
    'analytics:read',
    'media:*',
    'ai:*',
  ],
  LEARNER: [
    'course:enroll',
    'course:learn',
    'workshop:register',
    'community:participate',
    'certificate:read',
    'gamification:read',
    'ai:tutor',
    'payment:checkout',
  ],
  AFFILIATE: ['affiliate:read', 'affiliate:earnings', 'payment:read'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const permissions = ROLE_PERMISSIONS[user?.role ?? ''] ?? [];
    const allowed = required.every((permission) =>
      permissions.includes('*') || permissions.includes(permission) || permissions.includes(`${permission.split(':')[0]}:*`),
    );

    if (!allowed) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}

