import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DocumentReviewDecision } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';
import { BusinessApplication, VerificationDocument } from './onboarding.schema';

@Schema({ collection: 'document_reviews', timestamps: true, versionKey: false })
export class DocumentReview {
  @Prop({ type: Types.ObjectId, ref: VerificationDocument.name, required: true, index: true })
  documentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: BusinessApplication.name, required: true, index: true })
  applicationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  reviewerId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(DocumentReviewDecision), required: true })
  decision: DocumentReviewDecision;

  @Prop({
    trim: true,
    required(this: DocumentReview) {
      return this.decision !== DocumentReviewDecision.Accepted;
    },
  })
  note?: string;
}

export const DocumentReviewSchema = SchemaFactory.createForClass(DocumentReview);
