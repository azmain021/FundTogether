import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Campaign } from '../campaigns/schemas/campaign.schema';
import { CampaignStatus } from '../common/enums';
import { Watchlist } from './schemas/watchlist.schema';
import { WatchlistsService } from './watchlists.service';

describe('WatchlistsService', () => {
  const investorId = new Types.ObjectId();
  const campaignId = new Types.ObjectId();

  const campaignFindOne = jest.fn();
  const watchlistFindOneAndUpdate = jest.fn();
  const watchlistFindOne = jest.fn();
  const watchlistDeleteOne = jest.fn();
  const watchlistAggregate = jest.fn();

  let service: WatchlistsService;

  beforeEach(() => {
    jest.clearAllMocks();

    campaignFindOne.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: async () => ({ _id: campaignId }),
        }),
      }),
    });

    service = new WatchlistsService(
      {
        findOneAndUpdate: watchlistFindOneAndUpdate,
        findOne: watchlistFindOne,
        deleteOne: watchlistDeleteOne,
        aggregate: watchlistAggregate,
      } as unknown as Model<Watchlist>,
      {
        findOne: campaignFindOne,
      } as unknown as Model<Campaign>,
    );
  });

  it('adds a public campaign through an idempotent upsert', async () => {
    const saved = {
      _id: new Types.ObjectId(),
      investorId,
      campaignId,
    };

    watchlistFindOneAndUpdate.mockReturnValue({
      exec: async () => saved,
    });

    await expect(
      service.add(investorId, { campaignId: campaignId.toHexString() }),
    ).resolves.toEqual(saved);

    expect(campaignFindOne).toHaveBeenCalledWith({
      _id: campaignId,
      status: {
        $in: [CampaignStatus.Active, CampaignStatus.Funded],
      },
      deletedAt: null,
    });

    expect(watchlistFindOneAndUpdate).toHaveBeenCalledWith(
      { investorId, campaignId },
      { $setOnInsert: { investorId, campaignId } },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );
  });

  it('does not add a draft or private campaign', async () => {
    campaignFindOne.mockReturnValue({
      select: () => ({
        lean: () => ({
          exec: async () => null,
        }),
      }),
    });

    await expect(
      service.add(investorId, { campaignId: campaignId.toHexString() }),
    ).rejects.toThrow(NotFoundException);

    expect(watchlistFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('removes only the signed-in investor’s watchlist row', async () => {
    watchlistDeleteOne.mockReturnValue({
      exec: async () => ({ deletedCount: 1 }),
    });

    await service.remove(investorId, campaignId);

    expect(watchlistDeleteOne).toHaveBeenCalledWith({
      investorId,
      campaignId,
    });
  });

  it('uses a lookup so saved campaigns show live progress and status', async () => {
    watchlistAggregate.mockReturnValue({
      exec: async () => [],
    });

    await expect(service.list(investorId)).resolves.toEqual([]);

    const pipeline = watchlistAggregate.mock.calls[0][0] as Array<Record<string, unknown>>;

    expect(pipeline[0]).toEqual({
      $match: { investorId },
    });

    expect(JSON.stringify(pipeline)).toContain('"$lookup"');
    expect(JSON.stringify(pipeline)).toContain('fundingProgress');
    expect(JSON.stringify(pipeline)).not.toContain('CampaignStatus.Active');
  });
});