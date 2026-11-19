import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  BusinessSector,
  BusinessSize,
  BusinessType,
  VerificationStatus,
} from '../../common/enums';
import { User } from '../../users/schemas/user.schema';

// Model: a business profile and its classification (F1). Verification fields
// are server-managed and are never accepted from request bodies.
@Schema({ collection: 'businesses', timestamps: true, versionKey: false })
export class Business {
  // Always set from the authenticated session, never from a request body.
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ default: 0, select: false })
  onboardingVersion: number;

  @Prop({ required: true, trim: true, maxlength: 150 })
  officialName: string;

  @Prop({ type: String, required: true, enum: Object.values(BusinessType) })
  businessType: BusinessType;

  @Prop({ type: String, required: true, enum: Object.values(BusinessSector) })
  sector: BusinessSector;

  @Prop({ type: String, required: true, enum: Object.values(BusinessSize) })
  size: BusinessSize;

  @Prop({ required: true, min: 1900 })
  establishedYear: number;

  @Prop({ trim: true, maxlength: 1000 })
  operatingHistory?: string;

  @Prop({ required: true, min: 0 })
  employeeCount: number;

  @Prop({ required: true, trim: true, maxlength: 50 })
  division: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  district: string;

  @Prop({ required: true, trim: true, maxlength: 300 })
  address: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ type: String, trim: true })
  website?: string | null;

  @Prop({ required: true, trim: true, lowercase: true })
  businessEmail: string;

  @Prop({ required: true, trim: true })
  contactPhone: string;

  @Prop({
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.Draft,
    index: true,
  })
  verificationStatus: VerificationStatus;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type BusinessDocument = HydratedDocument<Business>;
export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ ownerId: 1 }, {
  name: 'one_active_business_per_owner',
  unique: true,
  partialFilterExpression: { deletedAt: null, ownerId: { $type: 'objectId' } },
});
