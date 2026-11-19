import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './session.guard';

export type CurrentAccount = AuthenticatedRequest['user'];

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): CurrentAccount =>
  context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
