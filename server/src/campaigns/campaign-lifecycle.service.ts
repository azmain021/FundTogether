import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { ClientSession } from 'mongoose';
import { AuditWriter } from '../audit/audit-writer.service';
import { AuditAction, CampaignStatus } from '../common/enums';
import { Campaign } from './schemas/campaign.schema';

@Injectable()
export class CampaignLifecycleService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaigns: Model<Campaign>,
    private readonly audit: AuditWriter,
  ) {}

  async reserveUnits(id: Types.ObjectId, units: number, now: Date, session: ClientSession) {
    const active = { _id: id, status: CampaignStatus.Active, endsAt: { $gt: now }, deletedAt: null };
    const campaign = await this.campaigns.findOneAndUpdate(
      { ...active, remainingUnits: { $gte: units } },
      { $inc: { remainingUnits: -units } },
      { returnDocument: 'after', session },
    ).exec();
    if (campaign) return campaign;

    const current = await this.campaigns.findOne({ _id: id, deletedAt: null }).session(session).exec();
    if (current?.status === CampaignStatus.Funded ||
        (current?.status === CampaignStatus.Active && current.endsAt && current.endsAt > now)) {
      throw new ConflictException({ code: 'UNITS_UNAVAILABLE', message: 'The requested units are no longer available.' });
    }
    throw new ConflictException({ code: 'CAMPAIGN_NOT_ACTIVE', message: 'This campaign is no longer accepting investments.' });
  }

  async markFundedIfSoldOut(id: Types.ObjectId, session: ClientSession) {
    const updated = await this.campaigns.updateOne(
      { _id: id, status: CampaignStatus.Active, remainingUnits: 0 },
      { $set: { status: CampaignStatus.Funded } },
      { session },
    ).exec();
    if (updated.modifiedCount) {
      await this.audit.record({
        actor: { role: 'system' },
        action: AuditAction.CampaignStatusChanged,
        entityType: 'campaign',
        entityId: id,
        changes: { status: { before: CampaignStatus.Active, after: CampaignStatus.Funded } },
      }, session);
    }
  }
}
