import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongo, Model, PipelineStage, Types } from 'mongoose';
import { Campaign } from '../campaigns/schemas/campaign.schema';
import { CampaignStatus } from '../common/enums';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { Watchlist } from './schemas/watchlist.schema';

@Injectable()
export class WatchlistsService {
  constructor(
    @InjectModel(Watchlist.name) private readonly watchlists: Model<Watchlist>,
    @InjectModel(Campaign.name) private readonly campaigns: Model<Campaign>,
  ) {}

  async add(investorId: Types.ObjectId, dto: CreateWatchlistDto) {
    const campaignId = new Types.ObjectId(dto.campaignId);

    await this.assertPublicCampaign(campaignId);

    const identity = { investorId, campaignId };

    try {
      return await this.watchlists.findOneAndUpdate(
        identity,
        { $setOnInsert: identity },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      ).exec();
    } catch (error) {
      // The unique index is the final protection against simultaneous duplicate adds.
      if (!(error instanceof mongo.MongoServerError && error.code === 11000)) {
        throw error;
      }

      const existing = await this.watchlists.findOne(identity).exec();
      if (existing) return existing;

      throw error;
    }
  }

  async remove(investorId: Types.ObjectId, campaignId: Types.ObjectId): Promise<void> {
    await this.watchlists.deleteOne({ investorId, campaignId }).exec();
  }

  async list(investorId: Types.ObjectId) {
    const pipeline: PipelineStage[] = [
      { $match: { investorId } },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      { $unwind: '$campaign' },
     
      { $match: { 'campaign.deletedAt': null } },
      {
        $project: {
          _id: 1,
          savedAt: '$createdAt',
          campaign: {
            _id: '$campaign._id',
            title: '$campaign.title',
            fundingTarget: '$campaign.fundingTarget',
            unitPrice: '$campaign.unitPrice',
            totalUnits: '$campaign.totalUnits',
            remainingUnits: '$campaign.remainingUnits',
            status: '$campaign.status',
            startsAt: '$campaign.startsAt',
            endsAt: '$campaign.endsAt',
            businessSnapshot: '$campaign.businessSnapshot',
            purchasedUnits: {
              $subtract: ['$campaign.totalUnits', '$campaign.remainingUnits'],
            },
            fundingProgress: {
              $cond: [
                { $gt: ['$campaign.totalUnits', 0] },
                {
                  $divide: [
                    {
                      $subtract: [
                        '$campaign.totalUnits',
                        '$campaign.remainingUnits',
                      ],
                    },
                    '$campaign.totalUnits',
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      { $sort: { savedAt: -1, _id: -1 } },
    ];

    return this.watchlists.aggregate(pipeline).exec();
  }

  private async assertPublicCampaign(campaignId: Types.ObjectId): Promise<void> {
    const campaign = await this.campaigns.findOne({
      _id: campaignId,
      status: { $in: [CampaignStatus.Active, CampaignStatus.Funded] },
      deletedAt: null,
    }).select('_id').lean().exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
  }
}