import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { DocumentType } from '../document-types';

@Schema({ collection: 'documents', timestamps: true, versionKey: false })
export class VerificationDocument {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(DocumentType), required: true })
  type: DocumentType;

  @Prop({ required: true, select: false })
  storageKey: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ default: 'uploaded', enum: ['uploaded', 'accepted', 'replacement_requested', 'rejected', 'superseded'] })
  status: string;

  @Prop({ default: true })
  isCurrent: boolean;

  @Prop({ default: 0 })
  slot: number;

  @Prop({ type: Types.ObjectId })
  replacesDocumentId?: Types.ObjectId;

  @Prop()
  reviewNote?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  createdAt: Date;
}

export type VerificationDocumentRecord = HydratedDocument<VerificationDocument>;
export const VerificationDocumentSchema = SchemaFactory.createForClass(VerificationDocument);
VerificationDocumentSchema.index({ businessId: 1, type: 1, slot: 1 }, {
  unique: true, partialFilterExpression: { isCurrent: true, deletedAt: null },
});

@Schema({ collection: 'business_applications', timestamps: true, versionKey: false })
export class BusinessApplication {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  round: number;

  @Prop({ default: 'submitted', enum: ['submitted', 'under_review', 'changes_requested', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: [Types.ObjectId], required: true })
  checklist: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  profileSnapshot: Record<string, unknown>;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop()
  decisionReason?: string;

  @Prop()
  decidedAt?: Date;
}

export const BusinessApplicationSchema = SchemaFactory.createForClass(BusinessApplication);
BusinessApplicationSchema.index({ businessId: 1, round: 1 }, { unique: true });
