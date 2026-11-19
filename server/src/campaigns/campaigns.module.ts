import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { campaignModels } from '../database/model-definitions';
import { AuthModule } from '../auth/auth.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature(campaignModels),
    BusinessesModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
