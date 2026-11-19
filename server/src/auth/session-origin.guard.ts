import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

// Reject cross-site browser writes. JSON requests from the app use its exact
// configured origin; requests without Origin also support Postman and tests.
@Injectable()
export class SessionOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.headers['sec-fetch-site'] === 'cross-site') {
      throw new ForbiddenException('Cross-site requests are not allowed');
    }
    const origin = request.headers.origin;
    const allowed = new Set([this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173']);
    if (this.config.get<string>('NODE_ENV') !== 'production') {
      allowed.add('http://localhost:5173');
      allowed.add('http://127.0.0.1:5173');
    }
    if (origin && !allowed.has(origin)) {
      throw new ForbiddenException('Request origin is not allowed');
    }
    return true;
  }
}
