import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole, VerificationStatus } from '../common/enums';
import type { AuthenticatedRequest } from '../auth/session.guard';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business, BusinessDocument } from './schemas/business.schema';

// Fields that cannot change once a business is submitted or approved (D-11).
const LOCKED_AFTER_SUBMISSION = ['officialName', 'businessType', 'sector'] as const;

@Injectable()
export class BusinessesService {
  constructor(@InjectModel(Business.name) private readonly businessModel: Model<Business>) {}

  async create(dto: CreateBusinessDto, ownerId: string): Promise<BusinessDocument> {
    this.assertEstablishedYear(dto.establishedYear);
    if (await this.findMine(ownerId)) throw new ConflictException('You already have a business profile');
    try {
      return await this.businessModel.create({ ...dto, ownerId: new Types.ObjectId(ownerId) });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ConflictException('You already have a business profile');
      }
      throw error;
    }
  }

  findMine(ownerId: string): Promise<BusinessDocument | null> {
    return this.businessModel.findOne({ ownerId: new Types.ObjectId(ownerId), deletedAt: null }).exec();
  }

  findAll(user: AuthenticatedRequest['user']): Promise<BusinessDocument[]> {
    const filter = user.role === UserRole.Admin ? { deletedAt: null } : { ownerId: new Types.ObjectId(user.id), deletedAt: null };
    return this.businessModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findForUser(id: Types.ObjectId, user: AuthenticatedRequest['user']): Promise<BusinessDocument> {
    const business = await this.findOne(id);
    if (user.role !== UserRole.Admin && business.ownerId?.toString() !== user.id) {
      throw new ForbiddenException('You cannot access another owner’s business');
    }
    return business;
  }

  async findOne(id: Types.ObjectId): Promise<BusinessDocument> {
    const business = await this.businessModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async update(id: Types.ObjectId, dto: UpdateBusinessDto, user: AuthenticatedRequest['user']): Promise<BusinessDocument> {
    const business = await this.findForUser(id, user);

    const isLocked =
      business.verificationStatus === VerificationStatus.Pending ||
      business.verificationStatus === VerificationStatus.Approved;
    const lockedFields = LOCKED_AFTER_SUBMISSION.filter(
      (field) => dto[field] !== undefined && dto[field] !== business[field],
    );
    if (isLocked && lockedFields.length > 0) {
      throw new ConflictException(
        `${lockedFields.join(', ')} cannot be changed while the business is ${business.verificationStatus}`,
      );
    }
    if (dto.establishedYear !== undefined) {
      this.assertEstablishedYear(dto.establishedYear);
    }

    // Match the state that was checked above, so a simultaneous submission
    // cannot unlock an edit that should now be forbidden.
    const updated = await this.businessModel.findOneAndUpdate({
      _id: id, ownerId: new Types.ObjectId(user.id), deletedAt: null,
      verificationStatus: business.verificationStatus,
    }, { $set: dto, $inc: { onboardingVersion: 1 } }, { new: true, runValidators: true }).exec();
    if (!updated) throw new ConflictException('The business status changed. Reload the profile and try again');
    return updated;
  }

  // Soft delete, and only for drafts: submitted or approved businesses keep their history.
  async remove(id: Types.ObjectId, user: AuthenticatedRequest['user']): Promise<void> {
    const business = await this.findForUser(id, user);
    if (business.verificationStatus !== VerificationStatus.Draft) {
      throw new ConflictException('Only draft business profiles can be deleted');
    }
    const removed = await this.businessModel.findOneAndUpdate({
      _id: id, ownerId: new Types.ObjectId(user.id), deletedAt: null,
      verificationStatus: VerificationStatus.Draft,
    }, { $set: { deletedAt: new Date() }, $inc: { onboardingVersion: 1 } }).exec();
    if (!removed) throw new ConflictException('The business status changed. Reload and try again');
  }

  /** Campaign gate (BR-03): used by CampaignsService before creating or editing campaigns. */
  async assertApproved(id: Types.ObjectId, user?: AuthenticatedRequest['user']): Promise<BusinessDocument> {
    const business = user ? await this.findForUser(id, user) : await this.findOne(id);
    if (business.verificationStatus !== VerificationStatus.Approved) {
      throw new ForbiddenException('Business verification must be approved before campaign creation');
    }
    return business;
  }

  private assertEstablishedYear(year: number): void {
    if (year > new Date().getFullYear()) {
      throw new BadRequestException(['establishedYear cannot be in the future']);
    }
  }
}
