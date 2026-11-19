import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { NotificationsService } from './notifications-service.contract';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationWriter implements NotificationsService {
  constructor(@InjectModel(Notification.name) private readonly notifications: Model<Notification>) {}

  async notify(notification: Parameters<NotificationsService['notify']>[0], notificationId?: Types.ObjectId): Promise<void> {
    const { recipientIds, ...fields } = notification;
    if (notificationId) {
      if (recipientIds.length !== 1) throw new Error('A notification ID requires exactly one recipient');
      await this.notifications.updateOne(
        { _id: notificationId },
        { $setOnInsert: { ...fields, recipientId: recipientIds[0], readAt: null } },
        { upsert: true, runValidators: true, timestamps: { updatedAt: false } },
      ).exec();
      return;
    }
    await this.notifications.insertMany(recipientIds.map(recipientId => ({ ...fields, recipientId })));
  }
}
