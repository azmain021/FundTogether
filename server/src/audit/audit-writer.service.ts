import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import type { AuditService } from './audit-service.contract';
import { AuditEvent } from './schemas/audit-event.schema';

@Injectable()
export class AuditWriter implements AuditService {
  constructor(@InjectModel(AuditEvent.name) private readonly events: Model<AuditEvent>) {}

  async record(event: Parameters<AuditService['record']>[0], session?: ClientSession): Promise<void> {
    const { actor, ...fields } = event;
    await this.events.create([{
      ...fields, actorRole: actor.role, actorId: 'id' in actor ? actor.id : undefined,
    }], { session });
  }
}
