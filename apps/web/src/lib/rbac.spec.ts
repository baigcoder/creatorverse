import { describe, expect, it } from 'vitest';
import { canAccessPath, getDefaultPathForRole, getRoutePolicy, getSafeRedirectPath } from './rbac';

describe('route RBAC policy', () => {
  it('allows admin roles into admin routes only', () => {
    expect(canAccessPath('/admin', 'SUPER_ADMIN')).toBe(true);
    expect(canAccessPath('/admin/users', 'ADMIN')).toBe(true);
    expect(canAccessPath('/admin/users', 'CREATOR')).toBe(false);
    expect(canAccessPath('/admin/users', 'LEARNER')).toBe(false);
  });

  it('allows creator console routes for creators and admins', () => {
    expect(canAccessPath('/dashboard', 'CREATOR')).toBe(true);
    expect(canAccessPath('/dashboard/courses/123/builder', 'ADMIN')).toBe(true);
    expect(canAccessPath('/dashboard/settings', 'SUPER_ADMIN')).toBe(true);
    expect(canAccessPath('/dashboard/courses', 'LEARNER')).toBe(false);
  });

  it('keeps learning routes available to authenticated platform roles', () => {
    expect(canAccessPath('/learn', 'LEARNER')).toBe(true);
    expect(canAccessPath('/learn/courses/123', 'AFFILIATE')).toBe(true);
    expect(canAccessPath('/learn/workshops', 'CREATOR')).toBe(true);
  });

  it('does not protect public routes through the dashboard policy', () => {
    expect(getRoutePolicy('/dashboarding')).toBeNull();
    expect(canAccessPath('/checkout/course/123', null)).toBe(true);
  });

  it('resolves a safe role home for redirects', () => {
    expect(getDefaultPathForRole('SUPER_ADMIN')).toBe('/admin');
    expect(getDefaultPathForRole('ADMIN')).toBe('/admin');
    expect(getDefaultPathForRole('CREATOR')).toBe('/dashboard');
    expect(getDefaultPathForRole('LEARNER')).toBe('/learn');
    expect(getDefaultPathForRole('AFFILIATE')).toBe('/learn');
    expect(getDefaultPathForRole(null)).toBe('/learn');
  });

  it('sanitizes post-login redirects by role', () => {
    expect(getSafeRedirectPath('/dashboard/courses', 'CREATOR')).toBe('/dashboard/courses');
    expect(getSafeRedirectPath('/admin/users', 'LEARNER')).toBe('/learn');
    expect(getSafeRedirectPath('https://evil.test/admin', 'ADMIN')).toBe('/admin');
    expect(getSafeRedirectPath('//evil.test/admin', 'ADMIN')).toBe('/admin');
  });
});
