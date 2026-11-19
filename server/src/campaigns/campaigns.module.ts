import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Campaign.name, schema: CampaignSchema }]),
    BusinessesModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
