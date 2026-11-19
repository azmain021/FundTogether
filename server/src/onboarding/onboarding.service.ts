import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import type { AuthenticatedRequest } from '../auth/session.guard';
import { BusinessesService } from '../businesses/businesses.service';
import { Business, BusinessDocument } from '../businesses/schemas/business.schema';
import { VerificationStatus } from '../common/enums';
import { DocumentType, EDITABLE_BUSINESS_STATUSES, REQUIRED_DOCUMENT_TYPES, UploadedDocument } from './document-types';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { BusinessApplication, VerificationDocument, VerificationDocumentRecord } from './schemas/onboarding.schema';
import { StorageService, validateDocument } from './storage.service';

type Actor = AuthenticatedRequest['user'];

export function documentMetadata(document: VerificationDocumentRecord) {
  return {
    _id: document._id.toString(), businessId: document.businessId.toString(),
    type: document.type, originalName: document.originalName, mimeType: document.mimeType,
    sizeBytes: document.sizeBytes, status: document.status, isCurrent: document.isCurrent,
    replacesDocumentId: document.replacesDocumentId?.toString(),
    reviewNote: document.reviewNote, createdAt: document.createdAt,
  };
}

export function calculateEligibility(business: Business, documents: VerificationDocument[]) {
  const requiredFields: (keyof Business)[] = [
    'officialName', 'businessType', 'sector', 'size', 'establishedYear',
    'employeeCount', 'division', 'district', 'address', 'description', 'businessEmail', 'contactPhone',
  ];
  const missingFields = requiredFields.filter(field => business[field] === undefined || business[field] === null || String(business[field]).trim() === '');
  const current = documents.filter(document => document.isCurrent && !document.deletedAt);
  const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter(type => !current.some(document => document.type === type));
  const rejectedDocuments = current.filter(document => ['rejected', 'replacement_requested'].includes(document.status)).map(document => document.type);
  return { eligible: missingFields.length === 0 && missingDocuments.length === 0 && rejectedDocuments.length === 0, missingFields, missingDocuments, rejectedDocuments };
}

@Injectable()
export class OnboardingService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Business.name) private readonly businesses: Model<Business>,
    @InjectModel(VerificationDocument.name) private readonly documents: Model<VerificationDocument>,
    @InjectModel(BusinessApplication.name) private readonly applications: Model<BusinessApplication>,
    private readonly businessService: BusinessesService,
    private readonly storage: StorageService,
  ) {}

  async list(businessId: Types.ObjectId, actor: Actor) {
    await this.businessService.findForUser(businessId, actor);
    const records = await this.documents.find({ businessId, deletedAt: null }).sort({ createdAt: -1 }).exec();
    return records.map(documentMetadata);
  }

  async upload(businessId: Types.ObjectId, dto: UploadDocumentDto, file: UploadedDocument, actor: Actor) {
    const business = await this.businessService.findForUser(businessId, actor);
    this.assertEditable(business);
    validateDocument(file);
    const stored = await this.storage.save(file);
    try {
      return await this.connection.transaction(async session => {
        await this.lockBusiness(businessId, actor, session);
        const current = await this.documents.find({ businessId, type: dto.type, isCurrent: true, deletedAt: null }).session(session).exec();
        let previous = dto.replacesDocumentId ? current.find(item => item._id.toString() === dto.replacesDocumentId) : undefined;
        if (dto.replacesDocumentId && !previous) throw new NotFoundException('The document to replace was not found');
        if (dto.type !== DocumentType.OtherSupporting) previous ??= current[0];
        if (dto.type === DocumentType.OtherSupporting && !previous && current.length >= 3) {
          throw new ConflictException('At most three additional supporting documents are allowed');
        }
        const slot = previous?.slot ?? [0, 1, 2].find(value => !current.some(item => item.slot === value)) ?? 0;
        if (previous) {
          previous.status = 'superseded';
          previous.isCurrent = false;
          await previous.save({ session });
        }
        const [created] = await this.documents.create([{
          businessId, ownerId: new Types.ObjectId(actor.id), type: dto.type,
          ...stored,
          originalName: file.originalname.split(/[\\/]/).pop()?.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180) || `document.${stored.mimeType === 'application/pdf' ? 'pdf' : 'image'}`,
          sizeBytes: file.buffer.length, slot, replacesDocumentId: previous?._id,
        }], { session });
        return documentMetadata(created);
      });
    } catch (error: unknown) {
      await this.storage.remove(stored.storageKey).catch(() => undefined);
      throw error;
    }
  }

  async remove(documentId: Types.ObjectId, actor: Actor) {
    const document = await this.documents.findOne({ _id: documentId, deletedAt: null }).exec();
    if (!document) throw new NotFoundException('Document not found');
    await this.businessService.findForUser(document.businessId, actor);
    await this.connection.transaction(async session => {
      await this.lockBusiness(document.businessId, actor, session);
      await this.documents.updateOne({ _id: documentId, deletedAt: null }, { $set: { deletedAt: new Date(), isCurrent: false } }, { session });
    });
  }

  async download(documentId: Types.ObjectId, actor: Actor) {
    const document = await this.documents.findOne({ _id: documentId, deletedAt: null }).select('+storageKey').exec();
    if (!document) throw new NotFoundException('Document not found');
    await this.businessService.findForUser(document.businessId, actor);
    return { bytes: await this.storage.read(document.storageKey), originalName: document.originalName, mimeType: document.mimeType };
  }

  async eligibility(businessId: Types.ObjectId, actor: Actor) {
    const business = await this.businessService.findForUser(businessId, actor);
    const records = await this.documents.find({ businessId, isCurrent: true, deletedAt: null }).exec();
    return calculateEligibility(business, records);
  }

  async submit(businessId: Types.ObjectId, actor: Actor) {
    const owned = await this.businessService.findForUser(businessId, actor);
    this.assertEditable(owned);
    return this.connection.transaction(async session => {
      const business = await this.lockBusiness(businessId, actor, session);
      const records = await this.documents.find({ businessId, isCurrent: true, deletedAt: null }).session(session).exec();
      const eligibility = calculateEligibility(business, records);
      if (!eligibility.eligible) {
        throw new UnprocessableEntityException({ code: 'APPLICATION_INCOMPLETE', message: 'Complete the business profile and upload all required documents before submitting', ...eligibility });
      }
      const previous = await this.applications.findOne({ businessId }).sort({ round: -1 }).session(session).exec();
      const snapshot = business.toObject() as unknown as Record<string, unknown>;
      delete snapshot.onboardingVersion;
      const [application] = await this.applications.create([{
        businessId, ownerId: new Types.ObjectId(actor.id), round: (previous?.round ?? 0) + 1,
        checklist: records.map(document => document._id), profileSnapshot: snapshot, submittedAt: new Date(),
      }], { session });
      business.verificationStatus = VerificationStatus.Pending;
      await business.save({ session });
      return application;
    });
  }

  async current(businessId: Types.ObjectId, actor: Actor) {
    const business = await this.businessService.findForUser(businessId, actor);
    const application = await this.applications.findOne({ businessId }).sort({ round: -1 }).exec();
    const documents = await this.list(businessId, actor);
    return { business, application, documents, eligibility: await this.eligibility(businessId, actor) };
  }

  async history(businessId: Types.ObjectId, actor: Actor) {
    await this.businessService.findForUser(businessId, actor);
    return this.applications.find({ businessId }).sort({ round: -1 }).exec();
  }

  private assertEditable(business: Business) {
    if (!EDITABLE_BUSINESS_STATUSES.includes(business.verificationStatus)) {
      throw new ConflictException('Documents cannot be changed or submitted while the business is pending review or approved');
    }
  }

  private async lockBusiness(businessId: Types.ObjectId, actor: Actor, session: ClientSession): Promise<BusinessDocument> {
    // Every upload, deletion and submission writes this same record inside its
    // transaction, preventing races between file replacement and submission.
    const business = await this.businesses.findOneAndUpdate({
      _id: businessId, ownerId: new Types.ObjectId(actor.id), deletedAt: null,
      verificationStatus: { $in: EDITABLE_BUSINESS_STATUSES },
    }, { $inc: { onboardingVersion: 1 } }, { new: true, session }).exec();
    if (!business) throw new ConflictException('The application status changed. Reload the page before continuing');
    return business;
  }
}
