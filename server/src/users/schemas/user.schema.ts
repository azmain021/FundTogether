import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums';

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true, name: 'unique_account_email' });
