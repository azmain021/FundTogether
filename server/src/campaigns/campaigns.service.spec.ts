import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { BusinessesService } from '../businesses/businesses.service';
import { CampaignStatus, UserRole } from '../common/enums';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign } from './schemas/campaign.schema';

const business = { _id: new Types.ObjectId(), ownerId: new Types.ObjectId() };
const owner: CurrentAccount = {
  id: business.ownerId.toString(), displayName: 'Owner', email: 'owner@example.test',
  phone: '01712345678', role: UserRole.BusinessOwner, isActive: true,
};
const other = { ...owner, id: new Types.ObjectId().toString() };
const draft = () => ({
  _id: new Types.ObjectId(), businessId: business._id, ownerId: business.ownerId,
  status: CampaignStatus.Draft, fundingTarget: 5_000_000, unitPrice: 500, updatedAt: new Date(),
});

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
  const findOneAndUpdate = jest.fn();
  const updateOne = jest.fn();

  beforeEach(async () => {
    stored = null;
    findOneAndUpdate.mockReset();
    updateOne.mockReset();
    assertApproved = jest.fn(async (_id: Types.ObjectId) => business);
    const modelMock = {
      create: jest.fn(async (data: unknown) => data),
      findOne: jest.fn(() => ({ exec: async () => stored })),
      findOneAndUpdate,
      updateOne,
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
    const campaign = await service.create(validDto(), owner);
    expect(assertApproved).toHaveBeenCalledWith(business._id, owner);
    expect(campaign).toMatchObject({
      totalUnits: 10_000,
      remainingUnits: 10_000,
      status: CampaignStatus.Draft,
      ownerId: business.ownerId,
    });
  });

  it('rejects a target that is not an exact multiple of the unit price', async () => {
    await expect(service.create(validDto({ fundingTarget: 1001 }), owner)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects more than 100,000 units', async () => {
    await expect(
      service.create(validDto({ fundingTarget: 100_001, unitPrice: 1 }), owner),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuses campaigns for unapproved businesses', async () => {
    assertApproved.mockRejectedValueOnce(new ForbiddenException());
    await expect(service.create(validDto(), owner)).rejects.toThrow(ForbiddenException);
  });

  it('cannot edit a campaign that is under review', async () => {
    const campaign = { ...draft(), status: CampaignStatus.PendingReview };
    stored = campaign;
    await expect(
      service.update(campaign._id, { title: 'Changed' }, owner),
    ).rejects.toThrow(ConflictException);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('restricts draft detail to its owner or an admin', async () => {
    const campaign = draft();
    stored = campaign;
    await expect(service.findForUser(campaign._id, other)).rejects.toThrow(ForbiddenException);
    await expect(service.findForUser(campaign._id, { ...other, role: UserRole.Admin })).resolves.toEqual(campaign);
  });

  it('recalculates a rejected draft atomically and returns it to draft', async () => {
    const campaign = { ...draft(), status: CampaignStatus.Rejected };
    stored = campaign;
    findOneAndUpdate.mockReturnValue({ exec: async () => ({ ...campaign, status: CampaignStatus.Draft }) });
    await service.update(campaign._id, { unitPrice: 1000 }, owner);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: campaign._id, ownerId: campaign.ownerId, status: CampaignStatus.Rejected,
        fundingTarget: campaign.fundingTarget, unitPrice: campaign.unitPrice, updatedAt: campaign.updatedAt,
      }),
      { $set: expect.objectContaining({
        unitPrice: 1000, totalUnits: 5000, remainingUnits: 5000, status: CampaignStatus.Draft,
      }) },
      { returnDocument: 'after', runValidators: true },
    );
  });

  it('rejects a stale write if the draft changed after validation', async () => {
    const campaign = draft();
    stored = campaign;
    findOneAndUpdate.mockReturnValue({ exec: async () => null });
    await expect(service.update(campaign._id, { title: 'Changed' }, owner)).rejects.toThrow(ConflictException);
  });

  it('archives a rejected draft without deleting its record', async () => {
    const campaign = { ...draft(), status: CampaignStatus.Rejected };
    stored = campaign;
    updateOne.mockReturnValue({ exec: async () => ({ matchedCount: 1 }) });
    await service.remove(campaign._id, owner);
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: campaign._id, status: CampaignStatus.Rejected, deletedAt: null }),
      { $set: { deletedAt: expect.any(Date) } },
    );
  });
});
