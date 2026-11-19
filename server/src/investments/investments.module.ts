import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditWriter } from '../audit/audit-writer.service';
import { AuthModule } from '../auth/auth.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { FeatureModelsModule } from '../database/feature-models.module';
import { businessModels, campaignModels } from '../database/model-definitions';
import { NotificationWriter } from '../notifications/notification-writer.service';
import { WalletsModule } from '../wallets/wallets.module';
import { InvestmentDelivery } from './investment-delivery.service';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';

@Module({
  imports: [
    AuthModule, CampaignsModule, FeatureModelsModule, WalletsModule,
    MongooseModule.forFeature([...businessModels, ...campaignModels]),
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService, InvestmentDelivery, AuditWriter, NotificationWriter],
})
export class InvestmentsModule {}
