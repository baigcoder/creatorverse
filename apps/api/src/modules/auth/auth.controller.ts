import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, SupabaseExchangeDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipCsrf } from '../../common/decorators/skip-csrf.decorator';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf')
  @Public()
  @SkipCsrf()
  csrf(@Res({ passthrough: true }) res: Response) {
    const csrfToken = randomBytes(32).toString('base64url');
    this.setCsrfCookie(res, csrfToken);
    return { success: true, data: { csrfToken } };
  }

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto, this.getRequestContext(req));
    if (result.accessToken && result.refreshToken) {
      this.setAccessCookie(res, result.accessToken);
      this.setRefreshCookie(res, result.refreshToken);
    }
    return { success: true, data: this.toClientAuthResult(result) };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, this.getRequestContext(req));
    this.setAccessCookie(res, result.accessToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { success: true, data: this.toClientAuthResult(result) };
  }

  @Post('supabase/exchange')
  @Public()
  @HttpCode(HttpStatus.OK)
  async exchangeSupabase(
    @Body() dto: SupabaseExchangeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.exchangeSupabaseToken(dto, this.getRequestContext(req));
    this.setAccessCookie(res, result.accessToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { success: true, data: this.toClientAuthResult(result) };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: { id: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.getRefreshToken(req);
    await this.authService.logout(user.id, refreshToken, this.getRequestContext(req));
    this.clearAccessCookie(res);
    this.clearRefreshCookie(res);
    this.clearCsrfCookie(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: { id: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user.id, this.getRequestContext(req));
    this.clearAccessCookie(res);
    this.clearRefreshCookie(res);
    this.clearCsrfCookie(res);
    return { success: true, message: 'Logged out from all devices successfully' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.getRefreshToken(req);
    const result = await this.authService.refreshTokens(refreshToken, this.getRequestContext(req));
    this.setAccessCookie(res, result.accessToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { success: true, data: this.toClientAuthResult(result) };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.authService.forgotPassword(dto.email, this.getRequestContext(req));
    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    await this.authService.resetPassword(dto.token, dto.password, this.getRequestContext(req));
    return { success: true, message: 'Password reset successfully.' };
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    await this.authService.verifyEmail(dto.token, this.getRequestContext(req));
    return { success: true, message: 'Email verified successfully.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { id: string }) {
    const data = await this.authService.getMe(user.id);
    return { success: true, data };
  }

  private setAccessCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private setCsrfCookie(res: Response, csrfToken: string) {
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearAccessCookie(res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  private clearCsrfCookie(res: Response) {
    res.clearCookie('csrfToken', {
      httpOnly: false,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  private getRefreshToken(req: Request) {
    return req.cookies?.refreshToken || (req.body as { refreshToken?: string })?.refreshToken;
  }

  private getRequestContext(req: Request) {
    return {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
  }

  private toClientAuthResult<T extends { accessToken?: string | null; refreshToken?: string | null }>(result: T) {
    const { accessToken, refreshToken, ...clientResult } = result;
    void accessToken;
    void refreshToken;
    return clientResult;
  }
}
