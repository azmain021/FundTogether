import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReviewDecision } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';
import { Campaign } from './campaign.schema';

@Schema({ collection: 'campaign_reviews', timestamps: true, versionKey: false })
export class CampaignReview {
  @Prop({ type: Types.ObjectId, ref: Campaign.name, required: true, index: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  version: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(ReviewDecision), required: true })
  decision: ReviewDecision;

  @Prop({
    trim: true,
    required(this: CampaignReview) {
      return this.decision === ReviewDecision.Rejected;
    },
  })
  feedback?: string;

  @Prop({ default: false })
  notificationPending: boolean;

  createdAt?: Date;
}

export const CampaignReviewSchema = SchemaFactory.createForClass(CampaignReview);
CampaignReviewSchema.index({ campaignId: 1, version: 1 });
CampaignReviewSchema.index({ notificationPending: 1, updatedAt: 1 }, { partialFilterExpression: { notificationPending: true } });
