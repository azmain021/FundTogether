import type { Types } from 'mongoose';
import type { NotificationType } from '../common/enums';

export interface NotificationsService {
  notify(notification: {
    recipientIds: readonly Types.ObjectId[];
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    entityType: string;
    entityId: Types.ObjectId;
  }): Promise<void>;
}
