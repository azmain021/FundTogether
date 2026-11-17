import { jest } from '@jest/globals';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BusinessSector, BusinessType, VerificationStatus } from '../common/enums';
import { BusinessesService } from './businesses.service';
import { Business } from './schemas/business.schema';

const makeBusiness = (overrides: Record<string, unknown> = {}) => {
  const doc: Record<string, unknown> = {
    _id: new Types.ObjectId(),
    officialName: 'Shobuj Bazar',
    businessType: BusinessType.SoleProprietorship,
    sector: BusinessSector.GroceryRetail,
    verificationStatus: VerificationStatus.Draft,
    ...overrides,
  };
  doc.set = jest.fn((values: Record<string, unknown>) => Object.assign(doc, values));
  doc.save = jest.fn(async () => doc);
  return doc;
};

describe('BusinessesService', () => {
  let service: BusinessesService;
  let stored: Record<string, unknown> | null;

  beforeEach(async () => {
    stored = null;
    const modelMock = {
      create: jest.fn(async (dto: unknown) => dto),
      findOne: jest.fn(() => ({ exec: async () => stored })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessesService, { provide: getModelToken(Business.name), useValue: modelMock }],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
  });

  it('rejects an established year in the future', async () => {
    const nextYear = new Date().getFullYear() + 1;
    await expect(service.create({ establishedYear: nextYear } as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('locks name, type and sector once the business is approved (D-11)', async () => {
    stored = makeBusiness({ verificationStatus: VerificationStatus.Approved });
    await expect(
      service.update(stored._id as Types.ObjectId, { officialName: 'New name' }),
    ).rejects.toThrow(ConflictException);
  });

  it('still allows contact details to change after approval', async () => {
    stored = makeBusiness({ verificationStatus: VerificationStatus.Approved });
    const updated = await service.update(stored._id as Types.ObjectId, {
      contactPhone: '01712345678',
    });
    expect(updated.contactPhone).toBe('01712345678');
  });

  it('only deletes draft businesses', async () => {
    stored = makeBusiness({ verificationStatus: VerificationStatus.Pending });
    await expect(service.remove(stored._id as Types.ObjectId)).rejects.toThrow(ConflictException);
  });

  it('blocks campaigns for businesses that are not approved (BR-03)', async () => {
    stored = makeBusiness({ verificationStatus: VerificationStatus.Draft });
    await expect(service.assertApproved(stored._id as Types.ObjectId)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
