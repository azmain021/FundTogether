import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VerificationStatus } from '../common/enums';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business, BusinessDocument } from './schemas/business.schema';

// Fields that cannot change once a business is submitted or approved (D-11).
const LOCKED_AFTER_SUBMISSION = ['officialName', 'businessType', 'sector'] as const;

@Injectable()
export class BusinessesService {
  constructor(@InjectModel(Business.name) private readonly businessModel: Model<Business>) {}

  // TODO(auth): set ownerId from the authenticated user and enforce one business per owner (D-10).
  async create(dto: CreateBusinessDto): Promise<BusinessDocument> {
    this.assertEstablishedYear(dto.establishedYear);
    return this.businessModel.create(dto);
  }

  // TODO(auth): scope to the current owner (GET /businesses/me) and admins.
  findAll(): Promise<BusinessDocument[]> {
    return this.businessModel.find({ deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: Types.ObjectId): Promise<BusinessDocument> {
    const business = await this.businessModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async update(id: Types.ObjectId, dto: UpdateBusinessDto): Promise<BusinessDocument> {
    const business = await this.findOne(id);

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

    business.set(dto);
    return business.save();
  }

  // Soft delete, and only for drafts: submitted or approved businesses keep their history.
  async remove(id: Types.ObjectId): Promise<void> {
    const business = await this.findOne(id);
    if (business.verificationStatus !== VerificationStatus.Draft) {
      throw new ConflictException('Only draft business profiles can be deleted');
    }
    business.deletedAt = new Date();
    await business.save();
  }

  /** Campaign gate (BR-03): used by CampaignsService before creating or editing campaigns. */
  async assertApproved(id: Types.ObjectId): Promise<BusinessDocument> {
    const business = await this.findOne(id);
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
