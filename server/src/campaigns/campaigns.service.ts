import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessesService } from '../businesses/businesses.service';
import { CampaignStatus } from '../common/enums';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
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

  // TODO(auth): check that the business belongs to the current user.
  async create(dto: CreateCampaignDto): Promise<CampaignDocument> {
    const business = await this.businessesService.assertApproved(new Types.ObjectId(dto.businessId));
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

  // TODO(auth): replace with GET /campaigns/mine for owners and an admin queue.
  findAll(businessId?: Types.ObjectId): Promise<CampaignDocument[]> {
    const filter = businessId ? { businessId, deletedAt: null } : { deletedAt: null };
    return this.campaignModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: Types.ObjectId): Promise<CampaignDocument> {
    const campaign = await this.campaignModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async update(id: Types.ObjectId, dto: UpdateCampaignDto): Promise<CampaignDocument> {
    const campaign = await this.findOne(id);
    if (!EDITABLE_STATUSES.includes(campaign.status)) {
      throw new ConflictException(`A campaign cannot be edited while it is ${campaign.status}`);
    }
    await this.businessesService.assertApproved(campaign.businessId);

    campaign.set(dto);
    if (dto.fundingTarget !== undefined || dto.unitPrice !== undefined) {
      const totalUnits = CampaignsService.calculateTotalUnits(campaign.fundingTarget, campaign.unitPrice);
      campaign.totalUnits = totalUnits;
      campaign.remainingUnits = totalUnits;
    }
    // Editing a rejected campaign returns it to draft for resubmission (F8).
    if (campaign.status === CampaignStatus.Rejected) {
      campaign.status = CampaignStatus.Draft;
    }
    return campaign.save();
  }

  // Soft delete, drafts only.
  async remove(id: Types.ObjectId): Promise<void> {
    const campaign = await this.findOne(id);
    if (campaign.status !== CampaignStatus.Draft) {
      throw new ConflictException('Only draft campaigns can be deleted');
    }
    campaign.deletedAt = new Date();
    await campaign.save();
  }
}
