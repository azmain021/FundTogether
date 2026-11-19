import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BusinessSector, CampaignStatus } from '../../common/enums';
import { Business } from '../../businesses/schemas/business.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ _id: false })
class CampaignBusinessSnapshot {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, enum: Object.values(BusinessSector) })
  sector: BusinessSector;

  @Prop({ required: true, trim: true })
  division: string;

  @Prop({ required: true, trim: true })
  district: string;
}

const CampaignBusinessSnapshotSchema = SchemaFactory.createForClass(CampaignBusinessSnapshot);

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

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  fundingTarget: number;

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  unitPrice: number;

  @Prop({ required: true, min: 1, max: 100_000, validate: Number.isSafeInteger })
  totalUnits: number;

  @Prop({
    required: true,
    min: 0,
    max: 100_000,
    validate(this: Campaign, value: number) {
      return Number.isSafeInteger(value) && (this.totalUnits === undefined || value <= this.totalUnits);
    },
  })
  remainingUnits: number;

  @Prop({ required: true, min: 7, max: 90, validate: Number.isSafeInteger })
  durationDays: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  endsAt?: Date;

  @Prop()
  submittedAt?: Date;

  @Prop()
  firstInvestmentAt?: Date;

  @Prop({ type: String, enum: Object.values(CampaignStatus), default: CampaignStatus.Draft })
  status: CampaignStatus;

  @Prop({ default: 1, min: 1, validate: Number.isSafeInteger })
  version: number;

  @Prop({ type: CampaignBusinessSnapshotSchema })
  businessSnapshot?: CampaignBusinessSnapshot;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  updatedAt?: Date;
}

export type CampaignDocument = HydratedDocument<Campaign>;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ status: 1, submittedAt: 1, _id: 1 });
CampaignSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
CampaignSchema.index({ status: 1, endsAt: 1 });
CampaignSchema.index({ title: 'text', description: 'text', 'businessSnapshot.name': 'text' });
