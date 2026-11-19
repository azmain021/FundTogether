import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { campaignModels } from '../database/model-definitions';
import { FeatureModelsModule } from '../database/feature-models.module';
import { AuditWriter } from '../audit/audit-writer.service';
import { NotificationWriter } from '../notifications/notification-writer.service';
import { AuthModule } from '../auth/auth.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignReviewService } from './campaign-review.service';
import { CampaignReviewDelivery } from './campaign-review-delivery.service';
import { AdminCampaignsController } from './admin-campaigns.controller';
import { MarketplaceCampaignsController } from './marketplace-campaigns.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature(campaignModels),
    BusinessesModule,
    FeatureModelsModule,
  ],
  controllers: [CampaignsController, AdminCampaignsController, MarketplaceCampaignsController],
  providers: [CampaignsService, CampaignReviewService, CampaignReviewDelivery, AuditWriter, NotificationWriter],
})
export class CampaignsModule {}
