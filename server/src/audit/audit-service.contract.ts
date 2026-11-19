import type { ClientSession, Types } from 'mongoose';
import type { AuditAction, UserRole } from '../common/enums';
import type { AuditEvent } from './schemas/audit-event.schema';

export interface AuditService {
  record(event: {
    actor: { id: Types.ObjectId; role: UserRole } | { role: 'system' };
    action: AuditAction;
    entityType: string;
    entityId: Types.ObjectId;
    reason?: string;
    changes?: AuditEvent['changes'];
  }, session?: ClientSession): Promise<void>;
}
