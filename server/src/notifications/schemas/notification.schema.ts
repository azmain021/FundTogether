import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationType } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'notifications', timestamps: true, versionKey: false })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  recipientId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(NotificationType), required: true })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ required: true, trim: true })
  link: string;

  @Prop({ required: true, trim: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
