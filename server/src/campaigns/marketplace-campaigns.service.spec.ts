import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CampaignStatus } from '../common/enums';
import { BusinessesService } from '../businesses/businesses.service';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './schemas/campaign.schema';

describe('Marketplace campaign search', () => {
  const aggregate = jest.fn();

  beforeEach(() => {
    aggregate.mockReset();
  });

  async function createService() {
    const module = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getModelToken(Campaign.name),
          useValue: {
            aggregate,
          },
        },
        {
          provide: BusinessesService,
          useValue: {},
        },
      ],
    }).compile();

    return module.get(CampaignsService);
  }

  it('returns paginated active and funded campaigns only', async () => {
    aggregate.mockReturnValue({
      exec: async () => [{
        metadata: [{ total: 1 }],
        items: [{ _id: 'campaign-id', title: 'Tea Garden Expansion' }],
      }],
    });

    const service = await createService();

    await expect(service.listPublished({
      q: 'Tea Garden',
      sector: 'agriculture',
      status: 'active',
      sort: 'most_funded',
      page: 2,
      limit: 10,
    })).resolves.toEqual({
      items: [{ _id: 'campaign-id', title: 'Tea Garden Expansion' }],
      page: 2,
      total: 1,
    });

    const pipeline = aggregate.mock.calls[0][0] as Array<Record<string, unknown>>;
    expect(pipeline[0]).toMatchObject({
      $match: {
        status: { $in: [CampaignStatus.Active] },
        deletedAt: null,
        $text: { $search: 'Tea Garden' },
        'businessSnapshot.sector': 'agriculture',
      },
    });
  });

  it('rejects an invalid funding range', async () => {
    const service = await createService();

    await expect(service.listPublished({
      minTarget: 100_000,
      maxTarget: 10_000,
    })).rejects.toThrow(BadRequestException);

    expect(aggregate).not.toHaveBeenCalled();
  });
});