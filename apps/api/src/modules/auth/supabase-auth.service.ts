import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseClaims = {
  sub?: string;
  aud?: string | string[];
  iss?: string;
  email?: string;
  email_verified?: boolean;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseIdentity = {
  supabaseUserId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
};

@Injectable()
export class SupabaseAuthService {
  private readonly client: SupabaseClient | null;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url') || '';
    const key =
      this.configService.get<string>('supabase.publishableKey') ||
      this.configService.get<string>('supabase.serviceRoleKey') ||
      '';

    this.client = url && key
      ? createClient(url, key, {
          auth: {
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false,
          },
        })
      : null;
    this.issuer = this.configService.get<string>('supabase.jwtIssuer') || (url ? `${url}/auth/v1` : '');
    this.audience = this.configService.get<string>('supabase.jwtAudience') || 'authenticated';
  }

  async verifyAccessToken(accessToken: string): Promise<SupabaseIdentity> {
    if (!accessToken) throw new UnauthorizedException('Supabase access token is required');
    if (!this.client || !this.issuer) {
      throw new ServiceUnavailableException('Supabase auth is not configured');
    }

    const { data, error } = await this.client.auth.getClaims(accessToken);
    if (error || !data?.claims) {
      throw new UnauthorizedException('Invalid Supabase access token');
    }

    const claims = data.claims as SupabaseClaims;
    this.assertExpectedClaims(claims);

    const email = claims.email?.trim().toLowerCase();
    if (!claims.sub || !email) {
      throw new UnauthorizedException('Supabase token is missing required identity claims');
    }

    return {
      supabaseUserId: claims.sub,
      email,
      emailVerified: claims.email_verified ?? true,
      name: this.extractName(claims.user_metadata, email),
    };
  }

  private assertExpectedClaims(claims: SupabaseClaims) {
    if (claims.iss !== this.issuer) {
      throw new UnauthorizedException('Supabase token issuer is not trusted');
    }

    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(this.audience)) {
      throw new UnauthorizedException('Supabase token audience is not trusted');
    }
  }

  private extractName(metadata: Record<string, unknown> | undefined, email: string) {
    const name = metadata?.name ?? metadata?.full_name ?? metadata?.display_name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    return email.split('@')[0] || 'SkillMango User';
  }
}
