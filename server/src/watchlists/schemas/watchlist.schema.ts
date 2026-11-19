import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ collection: 'watchlists', timestamps: true, versionKey: false })
export class Watchlist {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  investorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campaign.name, required: true, index: true })
  campaignId: Types.ObjectId;
}

export const WatchlistSchema = SchemaFactory.createForClass(Watchlist);
WatchlistSchema.index({ investorId: 1, campaignId: 1 }, { unique: true });
