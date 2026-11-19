import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'sessions', timestamps: true, versionKey: false })
export class Session {
  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
