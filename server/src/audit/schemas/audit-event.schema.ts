import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { AuditAction, UserRole } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'audit_events', timestamps: true, versionKey: false })
export class AuditEvent {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required(this: AuditEvent) {
      return this.actorRole !== 'system';
    },
  })
  actorId?: Types.ObjectId;

  @Prop({ type: String, enum: [...Object.values(UserRole), 'system'], required: true })
  actorRole: UserRole | 'system';

  @Prop({ type: String, enum: Object.values(AuditAction), required: true })
  action: AuditAction;

  @Prop({ required: true, trim: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  changes?: Record<string, { before?: unknown; after?: unknown }>;
}

export const AuditEventSchema = SchemaFactory.createForClass(AuditEvent);
AuditEventSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditEventSchema.index({ actorId: 1, createdAt: -1 });
AuditEventSchema.index({ action: 1, createdAt: -1 });
