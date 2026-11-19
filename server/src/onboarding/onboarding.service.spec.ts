import { ConflictException, ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { BusinessesService } from '../businesses/businesses.service';
import { Business } from '../businesses/schemas/business.schema';
import { BusinessSector, BusinessSize, BusinessType, UserRole, VerificationStatus } from '../common/enums';
import { DocumentType, REQUIRED_DOCUMENT_TYPES, UploadedDocument } from './document-types';
import { calculateEligibility, OnboardingService } from './onboarding.service';
import { BusinessApplication, VerificationDocument } from './schemas/onboarding.schema';
import { StorageService } from './storage.service';

const actor = { id: new Types.ObjectId().toString(), displayName: 'Test Owner', email: 'test@example.com', phone: '01712345678', role: UserRole.BusinessOwner, isActive: true };
const businessId = new Types.ObjectId();
const fixture: UploadedDocument = { buffer: Buffer.from('%PDF-1.4\nsynthetic course document'), originalname: 'synthetic.pdf', mimetype: 'application/pdf', size: 34 };

// These in-memory model doubles exercise the workflow without writing test
// registrations or documents into the user's Atlas database.
function setup() {
  const business = {
    _id: businessId, ownerId: new Types.ObjectId(actor.id), officialName: 'Synthetic Test Business',
    businessType: BusinessType.SoleProprietorship, sector: BusinessSector.GroceryRetail, size: BusinessSize.Micro,
    establishedYear: 2020, employeeCount: 0, division: 'Dhaka', district: 'Dhaka', address: 'Synthetic test address',
    description: 'A synthetic profile used for automated registration tests.', businessEmail: actor.email,
    contactPhone: actor.phone, verificationStatus: VerificationStatus.Draft,
    save: jest.fn().mockImplementation(async () => business),
    toObject: () => ({ officialName: 'Synthetic Test Business', verificationStatus: business.verificationStatus }),
  };
  type TestDocument = Record<string, any>;
  const savedDocuments: TestDocument[] = [];
  const savedApplications: TestDocument[] = [];
  const bytes = new Map<string, Buffer>();
  function query<T>(value: () => T) {
    // Mongoose queries support both direct await and explicit exec().
    const promise = Promise.resolve().then(value);
    type Query = Promise<T> & { exec: () => Promise<T>; session: (session: unknown) => Query; sort: (sort: unknown) => Query; select: (select: unknown) => Query };
    const result: Query = Object.assign(promise, { exec: () => promise, session: (_session: unknown) => result, sort: (_sort: unknown) => result, select: (_select: unknown) => result });
    return result;
  }
  function matches(document: TestDocument, filter: TestDocument) {
    return Object.entries(filter).every(([key, value]) => value == null ? document[key] == null : String(document[key]) === String(value));
  }
  const documents = {
    find: jest.fn().mockImplementation((filter: TestDocument) => query(() => savedDocuments.filter(document => matches(document, filter)))),
    findOne: jest.fn().mockImplementation((filter: TestDocument) => query(() => savedDocuments.find(document => matches(document, filter)) ?? null)),
    create: jest.fn().mockImplementation(async (records: TestDocument[]) => records.map(record => {
      const document: TestDocument = { _id: new Types.ObjectId(), createdAt: new Date(), status: 'uploaded', isCurrent: true, deletedAt: null, ...record };
      document.save = async () => document;
      savedDocuments.push(document);
      return document;
    })),
    updateOne: jest.fn().mockImplementation((filter: TestDocument, update: { $set: TestDocument }) => query(() => {
      const found = savedDocuments.find(document => matches(document, filter));
      if (found) Object.assign(found, update.$set);
      return { modifiedCount: found ? 1 : 0 };
    })),
  };
  const applications = {
    findOne: jest.fn().mockImplementation(() => query(() => savedApplications.at(-1) ?? null)),
    find: jest.fn().mockImplementation(() => query(() => savedApplications)),
    create: jest.fn().mockImplementation(async (records: TestDocument[]) => records.map(record => {
      const application = { _id: new Types.ObjectId(), status: 'submitted', ...record };
      savedApplications.push(application);
      return application;
    })),
  };
  const businessService = {
    findForUser: jest.fn().mockImplementation(async (_id: unknown, user: typeof actor) => {
      if (user.id !== actor.id) throw new ForbiddenException();
      return business;
    }),
  };
  const businesses = { findOneAndUpdate: jest.fn().mockImplementation(() => query(() => business)) };
  const connection = { transaction: async (operation: (session: ClientSession) => Promise<unknown>) => operation({} as ClientSession) };
  const storage = {
    save: jest.fn().mockImplementation(async (file: UploadedDocument) => {
      const storageKey = `${new Types.ObjectId()}.pdf`;
      bytes.set(storageKey, file.buffer);
      return { storageKey, mimeType: 'application/pdf' };
    }),
    read: jest.fn().mockImplementation(async (key: string) => bytes.get(key)),
    remove: jest.fn().mockImplementation(async (key: string) => { bytes.delete(key); }),
  };
  const service = new OnboardingService(connection as unknown as Connection, businesses as unknown as Model<Business>, documents as unknown as Model<VerificationDocument>, applications as unknown as Model<BusinessApplication>, businessService as unknown as BusinessesService, storage as unknown as StorageService);
  return { service, business, savedDocuments, savedApplications, documents, applications, businesses, storage };
}

describe('Business onboarding workflow', () => {
  it('saves uploads, lists safe metadata and downloads the original bytes', async () => {
    const { service } = setup();
    const uploaded = await service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor);
    expect(uploaded).not.toHaveProperty('storageKey');
    const reloaded = await service.list(businessId, actor);
    expect(reloaded[0]._id).toBe(uploaded._id);
    expect(reloaded[0]).not.toHaveProperty('storageKey');
    const download = await service.download(new Types.ObjectId(uploaded._id), actor);
    expect(download.bytes).toEqual(fixture.buffer);
  });

  it('keeps replaced versions and exposes only the replacement as current', async () => {
    const { service } = setup();
    const first = await service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor);
    const second = await service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor);
    const list = await service.list(businessId, actor);
    expect(list).toHaveLength(2);
    expect(list.find(document => document._id === first._id)).toMatchObject({ status: 'superseded', isCurrent: false });
    expect(second).toMatchObject({ replacesDocumentId: first._id, isCurrent: true });
  });

  it('refuses submission when bank account evidence is missing', async () => {
    const { service, applications, business } = setup();
    for (const type of REQUIRED_DOCUMENT_TYPES.filter(type => type !== DocumentType.BankAccountEvidence)) {
      await service.upload(businessId, { type }, fixture, actor);
    }
    expect(await service.eligibility(businessId, actor)).toMatchObject({ eligible: false, missingDocuments: ['bank_account_evidence'] });
    await expect(service.submit(businessId, actor)).rejects.toThrow(UnprocessableEntityException);
    expect(applications.create).not.toHaveBeenCalled();
    expect(business.verificationStatus).toBe(VerificationStatus.Draft);
  });

  it('submits a complete application and locks further uploads and resubmission', async () => {
    const { service, business, savedApplications } = setup();
    for (const type of REQUIRED_DOCUMENT_TYPES) await service.upload(businessId, { type }, fixture, actor);
    expect(await service.eligibility(businessId, actor)).toMatchObject({ eligible: true });
    const application = await service.submit(businessId, actor);
    expect(application).toMatchObject({ round: 1, status: 'submitted' });
    expect(savedApplications[0].checklist).toHaveLength(4);
    expect(business.verificationStatus).toBe(VerificationStatus.Pending);
    await expect(service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor)).rejects.toThrow(ConflictException);
    await expect(service.submit(businessId, actor)).rejects.toThrow(ConflictException);
    const status = await service.current(businessId, actor);
    expect(status.application?.status).toBe('submitted');
  });

  it('prevents another owner from listing, downloading or uploading documents', async () => {
    const { service, storage } = setup();
    const uploaded = await service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor);
    const other = { ...actor, id: new Types.ObjectId().toString() };
    await expect(service.list(businessId, other)).rejects.toThrow(ForbiddenException);
    await expect(service.download(new Types.ObjectId(uploaded._id), other)).rejects.toThrow(ForbiddenException);
    await expect(service.upload(businessId, { type: DocumentType.TaxEvidence }, fixture, other)).rejects.toThrow(ForbiddenException);
    expect(storage.save).toHaveBeenCalledTimes(1);
  });

  it('limits optional supporting documents to three', async () => {
    const { service, savedDocuments } = setup();
    for (let i = 0; i < 3; i++) await service.upload(businessId, { type: DocumentType.OtherSupporting }, fixture, actor);
    await expect(service.upload(businessId, { type: DocumentType.OtherSupporting }, fixture, actor)).rejects.toThrow(ConflictException);
    expect(savedDocuments).toHaveLength(3);
  });

  it('excludes removed documents from eligibility', async () => {
    const { service } = setup();
    const uploaded = await service.upload(businessId, { type: DocumentType.TradeLicence }, fixture, actor);
    await service.remove(new Types.ObjectId(uploaded._id), actor);
    expect(await service.list(businessId, actor)).toHaveLength(0);
    expect((await service.eligibility(businessId, actor)).missingDocuments).toContain(DocumentType.TradeLicence);
  });

  it('recognizes replacement requests even when all required types exist', () => {
    const { business } = setup();
    const documents = REQUIRED_DOCUMENT_TYPES.map(type => ({ type, isCurrent: true, status: type === DocumentType.OwnerIdentity ? 'replacement_requested' : 'accepted' }));
    expect(calculateEligibility(business, documents as VerificationDocument[])).toMatchObject({ eligible: false, rejectedDocuments: ['owner_identity'] });
  });
});
