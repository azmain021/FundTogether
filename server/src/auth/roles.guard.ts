import { applyDecorators, CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../common/enums';
import type { AuthenticatedRequest } from './session.guard';

const allowedRoles = Symbol('allowedRoles');

export function Roles(...roles: UserRole[]) {
  return applyDecorators(SetMetadata(allowedRoles, roles), UseGuards(RolesGuard));
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(allowedRoles, [
      context.getHandler(), context.getClass(),
    ]);
    if (!roles) return true;
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (user && roles.includes(user.role)) return true;
    throw new ForbiddenException(
      roles.length === 1 && roles[0] === UserRole.BusinessOwner
        ? 'A business owner account is required'
        : 'Your account cannot access this resource',
    );
  }
}
