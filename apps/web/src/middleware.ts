import { NextRequest, NextResponse } from 'next/server';
import { canAccessPath, getDefaultPathForRole, getRoutePolicy, pathMatchesPrefix, type UserRole } from '@/lib/rbac';
import { decodeAccessToken } from '@/lib/rbac-token';

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.search = '';
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (reason) url.searchParams.set('reason', reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete('accessToken');
  return response;
}

function redirectToSessionRefresh(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/refreshing';
  url.search = '';
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(url);
  response.cookies.delete('accessToken');
  return response;
}

function redirectByRole(request: NextRequest, role: UserRole | null) {
  const url = request.nextUrl.clone();
  url.pathname = getDefaultPathForRole(role);
  url.search = '';
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const session = decodeAccessToken(accessToken);
  const role = session?.role ?? null;
  const policy = getRoutePolicy(pathname);

  if (policy && !role) {
    if (refreshToken) {
      return redirectToSessionRefresh(request);
    }

    return redirectToLogin(request, accessToken ? 'session_expired' : 'login_required');
  }

  if (policy && !canAccessPath(pathname, role)) {
    return redirectByRole(request, role);
  }

  if (pathMatchesPrefix(pathname, '/auth') && role) {
    return redirectByRole(request, role);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/learn/:path*', '/admin/:path*', '/auth/:path*'],
};
