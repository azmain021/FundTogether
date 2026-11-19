import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export const RECOVERY_CODE_KIND = 'recovery_code';

@Schema({ collection: 'password_resets', timestamps: true, versionKey: false })
export class PasswordReset {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, select: false, match: /^[a-f0-9]{64}$/ })
  tokenHash: string;

  @Prop({ type: String, enum: [RECOVERY_CODE_KIND] })
  kind?: typeof RECOVERY_CODE_KIND;

  // Legacy email tokens retain their expiry. Recovery codes have no expiry date.
  @Prop({ type: Date })
  expiresAt?: Date | null;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
