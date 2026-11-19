import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationType } from '../common/enums';
import { NotificationWriter } from '../notifications/notification-writer.service';
import { Investment } from './schemas/investment.schema';

@Injectable()
export class InvestmentDelivery implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InvestmentDelivery.name);
  private timer?: NodeJS.Timeout;
  private retrying = false;

  constructor(
    @InjectModel(Investment.name) private readonly investments: Model<Investment>,
    private readonly notifications: NotificationWriter,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.retryPending(), 15_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  async deliver(id: Types.ObjectId): Promise<void> {
    try {
      const investment = await this.investments.findById(id).lean().exec();
      const pending = investment?.pendingNotifications;
      if (!investment || !pending) return;

      const entity = { entityType: 'investment', entityId: id };
      await this.notifications.notify({
        ...entity,
        recipientIds: [investment.investorId],
        type: NotificationType.InvestmentConfirmed,
        title: 'Investment confirmed',
        message: `Your purchase of ${investment.units} virtual units in ${pending.campaignTitle} is confirmed. Receipt ${investment.receiptNumber}.`,
        link: '/investor/wallet',
      }, id);
      await this.notifications.notify({
        ...entity,
        recipientIds: [pending.ownerId],
        type: NotificationType.NewInvestment,
        title: 'New investment',
        message: `${investment.units} virtual units were purchased in ${pending.campaignTitle}.`,
        link: `/business/campaigns/${investment.campaignId.toHexString()}`,
      }, pending.ownerNotificationId);
      await this.investments.updateOne({ _id: id }, { $unset: { pendingNotifications: 1 } }).exec();
    } catch {
      this.logger.warn(`Investment notification ${id.toHexString()} is pending retry`);
    }
  }

  private async retryPending(): Promise<void> {
    if (this.retrying) return;
    this.retrying = true;
    try {
      const pending = await this.investments.find({ pendingNotifications: { $exists: true } })
        .select('_id').sort({ updatedAt: 1 }).limit(25).lean().exec();
      for (const { _id } of pending) await this.deliver(_id);
    } catch {
      this.logger.warn('Could not read pending investment notifications');
    } finally {
      this.retrying = false;
    }
  }
}
