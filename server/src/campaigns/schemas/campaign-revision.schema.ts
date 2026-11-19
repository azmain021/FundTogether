import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { Campaign } from './campaign.schema';

@Schema({ collection: 'campaign_revisions', timestamps: true, versionKey: false })
export class CampaignRevision {
  @Prop({ type: Types.ObjectId, ref: Campaign.name, required: true, immutable: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger, immutable: true })
  version: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true, immutable: true })
  snapshot: Record<string, unknown>;

  @Prop({ required: true, immutable: true })
  submittedAt: Date;

  @Prop({ type: [String], default: [], immutable: true })
  changedFields: string[];
}

export const CampaignRevisionSchema = SchemaFactory.createForClass(CampaignRevision);
CampaignRevisionSchema.index({ campaignId: 1, version: 1 }, { unique: true });
