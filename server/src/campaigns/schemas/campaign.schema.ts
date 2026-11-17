import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CampaignStatus } from '../../common/enums';
import { Business } from '../../businesses/schemas/business.schema';
import { User } from '../../users/schemas/user.schema';

// Model: a simulated funding campaign (F6). Unit fields and status are computed
// and managed by CampaignsService, never accepted from request bodies.
// All amounts are whole virtual taka (D-07).
@Schema({ collection: 'campaigns', timestamps: true, versionKey: false })
export class Campaign {
  @Prop({ type: Types.ObjectId, ref: Business.name, required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  ownerId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  description: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  purpose: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  useOfFunds: string;

  @Prop({ required: true, min: 1 })
  fundingTarget: number;

  @Prop({ required: true, min: 1 })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  totalUnits: number;

  @Prop({ required: true, min: 0 })
  remainingUnits: number;

  @Prop({ required: true, min: 7, max: 90 })
  durationDays: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  endsAt?: Date;

  @Prop()
  firstInvestmentAt?: Date;

  @Prop({ type: String, enum: Object.values(CampaignStatus), default: CampaignStatus.Draft })
  status: CampaignStatus;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type CampaignDocument = HydratedDocument<Campaign>;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ status: 1, createdAt: -1 });
