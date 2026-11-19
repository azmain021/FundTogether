import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { publicUser } from './public-user';
import { SessionsService, sessionToken } from './sessions.service';

export type AuthenticatedRequest = Request & { user: ReturnType<typeof publicUser> };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.sessions.currentUser(sessionToken(request.headers.cookie));
    return true;
  }
}
