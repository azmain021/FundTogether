import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Business } from '../../businesses/schemas/business.schema';
import { ApplicationStatus, DocumentStatus, ReviewDecision } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';
import { DocumentType, MAX_DOCUMENT_BYTES } from '../document-types';

@Schema({ collection: 'documents', timestamps: true, versionKey: false })
export class VerificationDocument {
  @Prop({ type: Types.ObjectId, ref: Business.name, required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(DocumentType), required: true })
  type: DocumentType;

  @Prop({ required: true, select: false })
  storageKey: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true, enum: ['application/pdf', 'image/jpeg', 'image/png'] })
  mimeType: string;

  @Prop({ required: true, min: 1, max: MAX_DOCUMENT_BYTES, validate: Number.isSafeInteger })
  sizeBytes: number;

  @Prop({ default: DocumentStatus.Uploaded, enum: Object.values(DocumentStatus) })
  status: string;

  @Prop({ default: true })
  isCurrent: boolean;

  @Prop({ default: 0, min: 0, max: 2, validate: Number.isSafeInteger })
  slot: number;

  @Prop({ type: Types.ObjectId, ref: 'VerificationDocument' })
  replacesDocumentId?: Types.ObjectId;

  @Prop()
  reviewNote?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  createdAt: Date;
}

export type VerificationDocumentRecord = HydratedDocument<VerificationDocument>;
export const VerificationDocumentSchema = SchemaFactory.createForClass(VerificationDocument);
VerificationDocumentSchema.index({ businessId: 1, type: 1, createdAt: -1 });
VerificationDocumentSchema.index({ businessId: 1, type: 1, slot: 1 }, {
  unique: true, partialFilterExpression: { isCurrent: true, deletedAt: null },
});

@Schema({ collection: 'business_applications', timestamps: true, versionKey: false })
export class BusinessApplication {
  @Prop({ type: Types.ObjectId, ref: Business.name, required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, min: 1, validate: Number.isSafeInteger })
  round: number;

  @Prop({ default: ApplicationStatus.Submitted, enum: Object.values(ApplicationStatus) })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: VerificationDocument.name }], required: true })
  checklist: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  profileSnapshot: Record<string, unknown>;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ type: String, enum: Object.values(ReviewDecision) })
  decision?: ReviewDecision;

  @Prop()
  decisionReason?: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  decidedBy?: Types.ObjectId;

  @Prop()
  decidedAt?: Date;
}

export const BusinessApplicationSchema = SchemaFactory.createForClass(BusinessApplication);
BusinessApplicationSchema.index({ businessId: 1, round: 1 }, { unique: true });
BusinessApplicationSchema.index({ status: 1, submittedAt: 1 });
