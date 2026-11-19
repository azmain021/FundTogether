import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { Business } from '../../businesses/schemas/business.schema';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import { AnalyticsReportStatus } from '../../common/enums';
import { User } from '../../users/schemas/user.schema';

@Schema({ _id: false })
class AnalyticsInsights {
  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ type: [String], required: true, default: undefined })
  highlights: string[];

  @Prop({ type: [String], required: true, default: undefined })
  concerns: string[];

  @Prop({ type: [String], required: true, default: undefined })
  suggestions: string[];
}

const AnalyticsInsightsSchema = SchemaFactory.createForClass(AnalyticsInsights);

@Schema({ collection: 'analytics_reports', timestamps: true, versionKey: false })
export class AnalyticsReport {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Business.name, required: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campaign.name })
  campaignId?: Types.ObjectId;

  @Prop({ required: true })
  periodFrom: Date;

  @Prop({
    required: true,
    validate(this: AnalyticsReport, value: Date) {
      return !this.periodFrom || value >= this.periodFrom;
    },
  })
  periodTo: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  metrics: Record<string, unknown>;

  @Prop({ required: true })
  metricsHash: string;

  @Prop({
    type: AnalyticsInsightsSchema,
    required(this: AnalyticsReport) {
      return this.status === AnalyticsReportStatus.Generated;
    },
  })
  insights?: AnalyticsInsights;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ required: true, trim: true })
  promptVersion: string;

  @Prop({ type: String, enum: Object.values(AnalyticsReportStatus), required: true })
  status: AnalyticsReportStatus;

  @Prop({ default: Date.now, required: true })
  generatedAt: Date;
}

export const AnalyticsReportSchema = SchemaFactory.createForClass(AnalyticsReport);
AnalyticsReportSchema.index({ businessId: 1, generatedAt: -1 });
AnalyticsReportSchema.index({ businessId: 1, metricsHash: 1, status: 1 });
