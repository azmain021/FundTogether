import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import { InvestmentStatus } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'investments', timestamps: true, versionKey: false })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  investorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campaign.name, required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 10_000, validate: Number.isSafeInteger })
  units: number;

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  unitPriceAtPurchase: number;

  @Prop({
    required: true,
    min: 1,
    validate(this: Investment, value: number) {
      return Number.isSafeInteger(value) && value === this.units * this.unitPriceAtPurchase;
    },
  })
  totalCost: number;

  @Prop({ required: true, trim: true, unique: true })
  receiptNumber: string;

  @Prop({
    required: true,
    lowercase: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  })
  idempotencyKey: string;

  @Prop({ type: String, enum: Object.values(InvestmentStatus), default: InvestmentStatus.Confirmed })
  status: InvestmentStatus;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ investorId: 1, idempotencyKey: 1 }, { unique: true });
InvestmentSchema.index({ investorId: 1, createdAt: -1 });
InvestmentSchema.index({ campaignId: 1, createdAt: -1 });
