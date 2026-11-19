import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationType, ReviewDecision } from '../common/enums';
import { NotificationWriter } from '../notifications/notification-writer.service';
import { CampaignReview } from './schemas/campaign-review.schema';
import { Campaign } from './schemas/campaign.schema';

@Injectable()
export class CampaignReviewDelivery implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CampaignReviewDelivery.name);
  private timer?: NodeJS.Timeout;
  private retrying = false;

  constructor(
    @InjectModel(CampaignReview.name) private readonly reviews: Model<CampaignReview>,
    @InjectModel(Campaign.name) private readonly campaigns: Model<Campaign>,
    private readonly notifications: NotificationWriter,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.retryPending(), 15_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  async deliver(reviewId: Types.ObjectId): Promise<void> {
    try {
      const review = await this.reviews.findOne({ _id: reviewId, notificationPending: true }).exec();
      if (!review) return;
      const campaign = await this.campaigns.findById(review.campaignId).select('title ownerId').exec();
      if (!campaign?.ownerId) throw new Error('Campaign owner missing');
      const approved = review.decision === ReviewDecision.Approved;
      await this.notifications.notify({
        recipientIds: [campaign.ownerId],
        type: approved ? NotificationType.CampaignApproved : NotificationType.CampaignRejected,
        title: approved ? 'Campaign published' : 'Campaign rejected',
        message: approved ? `${campaign.title} is now live in the marketplace.` : `Review feedback is available for ${campaign.title}.`,
        link: `/business/campaigns/${campaign._id.toString()}`,
        entityType: 'campaign',
        entityId: campaign._id,
      }, reviewId);
      await this.reviews.updateOne({ _id: reviewId }, { $set: { notificationPending: false } }).exec();
    } catch {
      this.logger.warn(`Campaign review notification ${reviewId.toString()} is pending retry`);
    }
  }

  private async retryPending(): Promise<void> {
    if (this.retrying) return;
    this.retrying = true;
    try {
      const pending = await this.reviews.find({ notificationPending: true })
        .select('_id').sort({ updatedAt: 1 }).limit(25).lean().exec();
      for (const { _id } of pending) await this.deliver(_id);
    } catch {
      this.logger.warn('Could not read pending campaign notifications');
    } finally {
      this.retrying = false;
    }
  }
}
