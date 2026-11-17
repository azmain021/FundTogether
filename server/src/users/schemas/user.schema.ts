import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums';

// Model: one account per Google identity. Created by the auth flow (Phase 0);
// `role` stays unset until onboarding, and `admin` is only assigned by the seed script.
@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  googleSub: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ type: String, enum: Object.values(UserRole) })
  role?: UserRole;

  @Prop({ default: true })
  isActive: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
