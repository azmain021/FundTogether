import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'wallets', timestamps: true, versionKey: false })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0, validate: Number.isSafeInteger })
  balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
