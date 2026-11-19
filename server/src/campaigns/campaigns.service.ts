import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { BusinessesService } from '../businesses/businesses.service';
import { CampaignStatus, UserRole } from '../common/enums';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListMarketplaceCampaignsDto } from './dto/list-marketplace-campaigns.dto';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';

const MAX_TOTAL_UNITS = 100_000; // D-05
const EDITABLE_STATUSES = [CampaignStatus.Draft, CampaignStatus.Rejected];

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
    private readonly businessesService: BusinessesService,
  ) {}

  /** totalUnits = fundingTarget / unitPrice; the target must divide exactly (D-05). */
  static calculateTotalUnits(fundingTarget: number, unitPrice: number): number {
    if (fundingTarget % unitPrice !== 0) {
      throw new BadRequestException(['fundingTarget must be an exact multiple of unitPrice']);
    }
    const totalUnits = fundingTarget / unitPrice;
    if (totalUnits < 1 || totalUnits > MAX_TOTAL_UNITS) {
      throw new BadRequestException([`totalUnits must be between 1 and ${MAX_TOTAL_UNITS}`]);
    }
    return totalUnits;
  }

  async create(dto: CreateCampaignDto, user: CurrentAccount): Promise<CampaignDocument> {
    this.assertBusinessOwner(user);
    const business = await this.businessesService.assertApproved(new Types.ObjectId(dto.businessId), user);
    const totalUnits = CampaignsService.calculateTotalUnits(dto.fundingTarget, dto.unitPrice);

    return this.campaignModel.create({
      title: dto.title,
      description: dto.description,
      purpose: dto.purpose,
      useOfFunds: dto.useOfFunds,
      fundingTarget: dto.fundingTarget,
      unitPrice: dto.unitPrice,
      durationDays: dto.durationDays,
      businessId: business._id,
      ownerId: business.ownerId,
      totalUnits,
      remainingUnits: totalUnits,
      status: CampaignStatus.Draft,
    });
  }

  async findMine(ownerId: string, query: ListCampaignsDto): Promise<CampaignDocument[]> {
    const owner = new Types.ObjectId(ownerId);
    const business = await this.businessesService.findMine(ownerId);
    // Older campaigns may lack ownerId. Their active business still identifies the owner.
    const ownership = business
      ? { $or: [{ ownerId: owner }, { ownerId: null, businessId: business._id }] }
      : { ownerId: owner };
    return this.campaignModel.find({
      ...ownership,
      deletedAt: null,
      ...(query.businessId ? { businessId: new Types.ObjectId(query.businessId) } : {}),
      ...(query.status ? { status: query.status } : {}),
    }).sort({ createdAt: -1, _id: -1 }).exec();
  }

  async listPublished(query: ListMarketplaceCampaignsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    if (
      query.minTarget !== undefined &&
      query.maxTarget !== undefined &&
      query.minTarget > query.maxTarget
    ) {
      throw new BadRequestException('minTarget cannot be greater than maxTarget');
    }

    const match: Record<string, unknown> = {
      status: {
        $in: query.status
          ? [query.status]
          : [CampaignStatus.Active, CampaignStatus.Funded],
      },
      deletedAt: null,
    };

    const search = query.q?.trim();
    if (search) {
      match.$text = { $search: search };
    }

    if (query.sector) {
      match['businessSnapshot.sector'] = query.sector;
    }

    if (query.division?.trim()) {
      match['businessSnapshot.division'] = query.division.trim();
    }

    if (query.district?.trim()) {
      match['businessSnapshot.district'] = query.district.trim();
    }

    if (query.minTarget !== undefined || query.maxTarget !== undefined) {
      match.fundingTarget = {
        ...(query.minTarget !== undefined ? { $gte: query.minTarget } : {}),
        ...(query.maxTarget !== undefined ? { $lte: query.maxTarget } : {}),
      };
    }

    const sort: Record<string, 1 | -1> =
      query.sort === 'ending_soon'
        ? { endsAt: 1, _id: -1 }
        : query.sort === 'least_remaining'
          ? { remainingUnits: 1, _id: -1 }
          : query.sort === 'most_funded'
            ? { fundingProgress: -1, _id: -1 }
            : { startsAt: -1, _id: -1 };

    const pipeline: PipelineStage[] = [
      { $match: match as never },
      ...(query.sort === 'most_funded'
        ? [{
            $set: {
              fundingProgress: {
                $cond: [
                  { $gt: ['$totalUnits', 0] },
                  {
                    $divide: [
                      { $subtract: ['$totalUnits', '$remainingUnits'] },
                      '$totalUnits',
                    ],
                  },
                  0,
                ],
              },
            },
          }] as PipelineStage[]
        : []),
      { $sort: sort },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                title: 1,
                fundingTarget: 1,
                unitPrice: 1,
                totalUnits: 1,
                remainingUnits: 1,
                status: 1,
                startsAt: 1,
                endsAt: 1,
                'businessSnapshot.name': 1,
                'businessSnapshot.sector': 1,
                'businessSnapshot.division': 1,
                'businessSnapshot.district': 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.campaignModel.aggregate<{
      metadata: Array<{ total: number }>;
      items: unknown[];
    }>(pipeline).exec();

    return {
      items: result?.items ?? [],
      page,
      total: result?.metadata[0]?.total ?? 0,
    };
  }

  async findPublished(id: Types.ObjectId) {
    const campaign = await this.campaignModel.findOne({
      _id: id, status: { $in: [CampaignStatus.Active, CampaignStatus.Funded] }, deletedAt: null,
    }).select(
      'title description purpose useOfFunds fundingTarget unitPrice totalUnits remainingUnits status startsAt endsAt ' +
      'businessSnapshot.name businessSnapshot.sector businessSnapshot.division businessSnapshot.district',
    ).lean().exec();
    if (!campaign) throw new NotFoundException('Campaign not found');
    return {
      ...campaign,
      acceptingInvestments: campaign.status === CampaignStatus.Active && campaign.remainingUnits > 0 &&
        !!campaign.endsAt && campaign.endsAt > new Date(),
    };
  }

  async findForUser(id: Types.ObjectId, user: CurrentAccount, session?: ClientSession): Promise<CampaignDocument> {
    const query = this.campaignModel.findOne({ _id: id, deletedAt: null });
    if (session) query.session(session);
    const campaign = await query.exec();
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    if (user.role === UserRole.Admin) return campaign;
    if (user.role !== UserRole.BusinessOwner) throw new ForbiddenException('Your account cannot access this campaign');
    if (!campaign.ownerId) {
      await this.businessesService.findForUser(campaign.businessId, user, session);
    } else if (campaign.ownerId.toString() !== user.id) {
      throw new ForbiddenException('You cannot access another owner’s campaign');
    }
    return campaign;
  }

  async update(id: Types.ObjectId, dto: UpdateCampaignDto, user: CurrentAccount): Promise<CampaignDocument> {
    this.assertBusinessOwner(user);
    const campaign = await this.findForUser(id, user);
    if (!EDITABLE_STATUSES.includes(campaign.status)) {
      throw new ConflictException(`A campaign cannot be edited while it is ${campaign.status}`);
    }
    await this.businessesService.assertApproved(campaign.businessId, user);

    const fields = {
      title: dto.title,
      description: dto.description,
      purpose: dto.purpose,
      useOfFunds: dto.useOfFunds,
      fundingTarget: dto.fundingTarget,
      unitPrice: dto.unitPrice,
      durationDays: dto.durationDays,
    };
    if (Object.values(fields).every(value => value === undefined)) {
      throw new BadRequestException('Provide at least one field to update');
    }
    const totalUnits = CampaignsService.calculateTotalUnits(
      dto.fundingTarget ?? campaign.fundingTarget,
      dto.unitPrice ?? campaign.unitPrice,
    );
    const updated = await this.campaignModel.findOneAndUpdate(
      {
        ...this.draftWriteFilter(campaign),
        fundingTarget: campaign.fundingTarget,
        unitPrice: campaign.unitPrice,
      },
      { $set: {
        ...fields,
        ownerId: new Types.ObjectId(user.id),
        totalUnits,
        remainingUnits: totalUnits,
        // A rejected campaign becomes a draft when the owner edits it (F8).
        status: CampaignStatus.Draft,
      } },
      { returnDocument: 'after', runValidators: true },
    ).exec();
    if (!updated) throw new ConflictException('The campaign changed. Reload it and try again.');
    return updated;
  }

  async remove(id: Types.ObjectId, user: CurrentAccount): Promise<void> {
    this.assertBusinessOwner(user);
    const campaign = await this.findForUser(id, user);
    if (!EDITABLE_STATUSES.includes(campaign.status)) {
      throw new ConflictException('Only draft or rejected campaigns can be archived');
    }
    // Archive the campaign record and keep any review history linked to it.
    const result = await this.campaignModel.updateOne(
      this.draftWriteFilter(campaign),
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!result.matchedCount) throw new ConflictException('The campaign changed. Reload it and try again.');
  }

  private draftWriteFilter(campaign: CampaignDocument) {
    return {
      _id: campaign._id,
      ownerId: campaign.ownerId ?? null,
      businessId: campaign.businessId,
      deletedAt: null,
      status: campaign.status,
      updatedAt: campaign.updatedAt ?? null,
    };
  }

  private assertBusinessOwner(user: CurrentAccount) {
    if (user.role !== UserRole.BusinessOwner) {
      throw new ForbiddenException('A business owner account is required');
    }
  }
}