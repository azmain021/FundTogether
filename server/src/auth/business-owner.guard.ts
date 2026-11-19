import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../common/enums';
import type { AuthenticatedRequest } from './session.guard';

@Injectable()
export class BusinessOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest<AuthenticatedRequest>().user?.role !== UserRole.BusinessOwner) {
      throw new ForbiddenException('A business owner account is required');
    }
    return true;
  }
}
