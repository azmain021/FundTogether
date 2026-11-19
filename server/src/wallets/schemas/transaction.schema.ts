import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TransactionType } from '../../common/enums';
import { Investment } from '../../investments/schemas/investment.schema';
import { User } from '../../users/schemas/user.schema';
import { Wallet } from './wallet.schema';

@Schema({ collection: 'transactions', timestamps: true, versionKey: false })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: Wallet.name, required: true })
  walletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TransactionType), required: true })
  type: TransactionType;

  // Both transaction types store a positive amount. The type determines its direction.
  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  amount: number;

  @Prop({ required: true, min: 0, validate: Number.isSafeInteger })
  balanceAfter: number;

  @Prop({
    type: Types.ObjectId,
    ref: Investment.name,
    required(this: Transaction) {
      return this.type === TransactionType.InvestmentDebit;
    },
  })
  investmentId?: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ walletId: 1, createdAt: -1 });
TransactionSchema.index(
  { walletId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: TransactionType.StarterCredit } },
);
TransactionSchema.index(
  { investmentId: 1 },
  { unique: true, partialFilterExpression: { investmentId: { $type: 'objectId' } } },
);
