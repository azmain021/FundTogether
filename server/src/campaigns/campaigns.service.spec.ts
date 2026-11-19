import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BusinessesService } from '../businesses/businesses.service';
import { CampaignStatus } from '../common/enums';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign } from './schemas/campaign.schema';

const business = { _id: new Types.ObjectId(), ownerId: new Types.ObjectId() };

const validDto = (overrides: Partial<CreateCampaignDto> = {}): CreateCampaignDto =>
  Object.assign(
    {
      businessId: business._id.toHexString(),
      title: 'Shobuj Bazar expansion',
      description: 'x'.repeat(60),
      purpose: 'Open a second outlet',
      useOfFunds: 'Fit-out and initial stock',
      fundingTarget: 5_000_000,
      unitPrice: 500,
      durationDays: 30,
    },
    overrides,
  );

describe('CampaignsService', () => {
  let service: CampaignsService;
  let assertApproved: jest.Mock<Promise<unknown>, [Types.ObjectId]>;
  let stored: Record<string, unknown> | null;

  beforeEach(async () => {
    stored = null;
    assertApproved = jest.fn(async (_id: Types.ObjectId) => business);
    const modelMock = {
      create: jest.fn(async (data: unknown) => data),
      findOne: jest.fn(() => ({ exec: async () => stored })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: getModelToken(Campaign.name), useValue: modelMock },
        { provide: BusinessesService, useValue: { assertApproved } },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  it('computes units on the server: ৳5,000,000 at ৳500 = 10,000 units', async () => {
    const campaign = await service.create(validDto());
    expect(campaign).toMatchObject({
      totalUnits: 10_000,
      remainingUnits: 10_000,
      status: CampaignStatus.Draft,
      ownerId: business.ownerId,
    });
  });

  it('rejects a target that is not an exact multiple of the unit price', async () => {
    await expect(service.create(validDto({ fundingTarget: 1001 }))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects more than 100,000 units', async () => {
    await expect(
      service.create(validDto({ fundingTarget: 100_001, unitPrice: 1 })),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuses campaigns for unapproved businesses', async () => {
    assertApproved.mockRejectedValueOnce(new ForbiddenException());
    await expect(service.create(validDto())).rejects.toThrow(ForbiddenException);
  });

  it('cannot edit a campaign that is under review', async () => {
    stored = { _id: new Types.ObjectId(), status: CampaignStatus.PendingReview };
    await expect(
      service.update(stored._id as Types.ObjectId, { title: 'Changed' }),
    ).rejects.toThrow(ConflictException);
  });
});
