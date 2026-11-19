import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { FeatureModelsModule } from '../database/feature-models.module';
import { campaignModels } from '../database/model-definitions';
import { WatchlistsController } from './watchlists.controller';
import { WatchlistsService } from './watchlists.service';

@Module({
  imports: [
    AuthModule,
    FeatureModelsModule,
    MongooseModule.forFeature(campaignModels),
  ],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
})
export class WatchlistsModule {}