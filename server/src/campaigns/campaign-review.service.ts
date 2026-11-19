import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Connection, Model, Types } from 'mongoose';
import { AuditWriter } from '../audit/audit-writer.service';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { BusinessesService } from '../businesses/businesses.service';
import { AuditAction, CampaignStatus, ReviewDecision, UserRole } from '../common/enums';
import { CampaignReviewDelivery } from './campaign-review-delivery.service';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ReviewCampaignDto } from './dto/review-campaign.dto';
import { CampaignReview } from './schemas/campaign-review.schema';
import { CampaignRevision } from './schemas/campaign-revision.schema';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';

const reviewConflict = () => new ConflictException('The campaign changed or has already been reviewed. Reload and try again.');

@Injectable()
export class CampaignReviewService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Campaign.name) private readonly campaigns: Model<Campaign>,
    @InjectModel(CampaignReview.name) private readonly reviews: Model<CampaignReview>,
    @InjectModel(CampaignRevision.name) private readonly revisions: Model<CampaignRevision>,
    private readonly campaignService: CampaignsService,
    private readonly businesses: BusinessesService,
    private readonly audit: AuditWriter,
    private readonly delivery: CampaignReviewDelivery,
  ) {}

  async detail(id: Types.ObjectId, user: CurrentAccount) {
    const campaign = await this.campaignService.findForUser(id, user);
    const [review, revision] = await Promise.all([
      this.reviews.findOne({ campaignId: id }).sort({ version: -1, createdAt: -1 }).exec(),
      user.role === UserRole.Admin && campaign.status === CampaignStatus.PendingReview
        ? this.revisions.findOne({ campaignId: id, version: campaign.version }).exec() : null,
    ]);
    const reviewContext = user.role === UserRole.Admin && campaign.status === CampaignStatus.PendingReview
      ? { submittedSnapshot: revision?.snapshot ?? null, businessVerificationStatus: (await this.businesses.findOne(campaign.businessId)).verificationStatus }
      : {};
    return Object.assign(campaign.toObject(), reviewContext, {
      latestReview: review ? {
        decision: review.decision, feedback: review.feedback, version: review.version, reviewedAt: review.createdAt,
      } : null,
    });
  }

  queue() {
    return this.campaigns.find({ status: CampaignStatus.PendingReview, deletedAt: null })
      .select('title businessId version submittedAt fundingTarget unitPrice totalUnits status')
      .populate<{ businessId: { officialName: string } | null }>('businessId', 'officialName')
      .sort({ submittedAt: 1, _id: 1 }).lean().exec();
  }

  async submit(id: Types.ObjectId, user: CurrentAccount) {
    if (user.role !== UserRole.BusinessOwner) throw new ForbiddenException('A business owner account is required');
    const ownerId = new Types.ObjectId(user.id);

    return this.connection.transaction(async session => {
      const campaign = await this.campaignService.findForUser(id, user, session);
      if (campaign.status !== CampaignStatus.Draft) throw new ConflictException('Only draft campaigns can be submitted');
      const input = await this.validateDraft(campaign);
      await this.businesses.lockApprovedForCampaign(campaign.businessId, ownerId, session);
      const lastRevision = await this.revisions.findOne({ campaignId: id }).sort({ version: -1 }).session(session).exec();
      const lastReview = await this.reviews.findOne({ campaignId: id }).sort({ version: -1 }).session(session).exec();
      const version = Math.max(campaign.version, (lastRevision?.version ?? 0) + 1, (lastReview?.version ?? 0) + 1);
      const submittedAt = new Date();
      const changedFields = lastRevision
        ? Object.entries(input).filter(([field, value]) => lastRevision.snapshot[field] !== value).map(([field]) => field)
        : [];
      const updated = await this.campaigns.findOneAndUpdate(
        { _id: id, deletedAt: null, status: CampaignStatus.Draft, updatedAt: campaign.updatedAt ?? null },
        { $set: { status: CampaignStatus.PendingReview, ownerId, version, submittedAt } },
        { session, returnDocument: 'after' },
      ).exec();
      if (!updated) throw reviewConflict();

      await this.revisions.create([{
        campaignId: id, version, submittedAt, changedFields,
        snapshot: { ...input, totalUnits: campaign.totalUnits, remainingUnits: campaign.remainingUnits },
      }], { session });
      await this.audit.record({
        actor: { id: ownerId, role: user.role }, action: AuditAction.CampaignSubmitted,
        entityType: 'campaign', entityId: id,
        changes: { status: { before: campaign.status, after: updated.status }, version: { before: campaign.version, after: version } },
      }, session);
      return updated;
    });
  }

  async decide(id: Types.ObjectId, dto: ReviewCampaignDto, admin: CurrentAccount) {
    if (admin.role !== UserRole.Admin) throw new ForbiddenException('An administrator account is required');
    const reviewerId = new Types.ObjectId(admin.id);
    const approved = dto.decision === ReviewDecision.Approved;
    const feedback = dto.feedback?.trim();
    if (!approved && !feedback) throw new BadRequestException('Feedback is required when rejecting a campaign');
    const result = await this.connection.transaction(async session => {
      const campaign = await this.campaignService.findForUser(id, admin, session);
      if (campaign.status !== CampaignStatus.PendingReview || campaign.version !== dto.version) throw reviewConflict();
      const revision = await this.revisions.findOne({ campaignId: id, version: dto.version }).session(session).exec();
      if (!revision || !campaign.ownerId) throw new ConflictException('This campaign has no saved submission for this version');

      let changes: Partial<Campaign> = { status: CampaignStatus.Rejected };
      if (approved) {
        const business = await this.businesses.lockApprovedForCampaign(campaign.businessId, campaign.ownerId, session);
        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + campaign.durationDays * 86_400_000);
        changes = { status: CampaignStatus.Active, startsAt, endsAt, businessSnapshot: {
          name: business.officialName, sector: business.sector, division: business.division, district: business.district,
        } };
      }
      const updated = await this.campaigns.findOneAndUpdate(
        { _id: id, deletedAt: null, status: CampaignStatus.PendingReview, version: dto.version },
        { $set: changes },
        { session, returnDocument: 'after', runValidators: true },
      ).exec();
      if (!updated) throw reviewConflict();
      const [review] = await this.reviews.create([{
        campaignId: id, reviewerId, version: dto.version, decision: dto.decision, feedback, notificationPending: true,
      }], { session });
      await this.audit.record({
        actor: { id: reviewerId, role: admin.role },
        action: approved ? AuditAction.CampaignApproved : AuditAction.CampaignRejected,
        entityType: 'campaign', entityId: id, reason: feedback,
        changes: { status: { before: campaign.status, after: updated.status } },
      }, session);
      return { updated, reviewId: review._id };
    });
    await this.delivery.deliver(result.reviewId);
    return result.updated;
  }

  private async validateDraft(campaign: CampaignDocument) {
    const fields = {
      businessId: campaign.businessId.toString(),
      title: campaign.title, description: campaign.description, purpose: campaign.purpose, useOfFunds: campaign.useOfFunds,
      fundingTarget: campaign.fundingTarget, unitPrice: campaign.unitPrice, durationDays: campaign.durationDays,
    };
    const input = plainToInstance(CreateCampaignDto, fields);
    const errors = await validate(input);
    if (errors.length) throw new BadRequestException(errors.flatMap(error => Object.values(error.constraints ?? {})));
    const units = CampaignsService.calculateTotalUnits(input.fundingTarget, input.unitPrice);
    if (campaign.totalUnits !== units || campaign.remainingUnits !== units) {
      throw new BadRequestException('Save the draft funding amounts again before submitting');
    }
    return fields;
  }
}
