import { Body, Controller, Get, Header, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterBusinessOwnerDto } from './dto/register-business-owner.dto';
import { LoginDto } from './dto/login.dto';
import { SessionOriginGuard } from './session-origin.guard';
import { SESSION_COOKIE, SESSION_DURATION_MS, SessionsService, sessionToken } from './sessions.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessions: SessionsService,
    private readonly config: ConfigService,
  ) {}

  @Post('register/business-owner')
  @UseGuards(SessionOriginGuard)
  @Header('Cache-Control', 'no-store')
  registerBusinessOwner(@Body() dto: RegisterBusinessOwnerDto) {
    return this.authService.registerBusinessOwner(dto);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(SessionOriginGuard)
  @Header('Cache-Control', 'no-store')
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.login(dto);
    // Issue a new random session on every login and revoke the browser's old one.
    const token = await this.sessions.create(user.id);
    await this.sessions.revoke(sessionToken(request.headers.cookie));
    response.cookie(SESSION_COOKIE, token, { ...this.cookieOptions(), maxAge: SESSION_DURATION_MS });
    return user;
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Req() request: Request) {
    return this.sessions.currentUser(sessionToken(request.headers.cookie));
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionOriginGuard)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.sessions.revoke(sessionToken(request.headers.cookie));
    response.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api',
    };
  }
}
