export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CREATOR', 'LEARNER', 'AFFILIATE'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type RoutePolicy = {
  prefix: string;
  roles: readonly UserRole[];
};

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;
const CREATOR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CREATOR'] as const;
const LEARNING_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CREATOR', 'LEARNER', 'AFFILIATE'] as const;

export const ROUTE_POLICIES: readonly RoutePolicy[] = [
  { prefix: '/admin', roles: ADMIN_ROLES },
  { prefix: '/dashboard', roles: CREATOR_ROLES },
  { prefix: '/learn', roles: LEARNING_ROLES },
];

const roleSet = new Set<string>(USER_ROLES);

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && roleSet.has(role);
}

export function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getRoutePolicy(pathname: string) {
  return ROUTE_POLICIES.find((policy) => pathMatchesPrefix(pathname, policy.prefix)) ?? null;
}

export function canAccessPath(pathname: string, role: UserRole | null) {
  const policy = getRoutePolicy(pathname);
  if (!policy) return true;
  return role ? policy.roles.includes(role) : false;
}

export function getDefaultPathForRole(role: UserRole | null) {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin';
  if (role === 'CREATOR') return '/dashboard';
  return '/learn';
}

export function getSafeRedirectPath(next: string | null | undefined, role: UserRole | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return getDefaultPathForRole(role);
  }

  return canAccessPath(next, role) ? next : getDefaultPathForRole(role);
}
