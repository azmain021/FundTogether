import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { featureModels } from './model-definitions';

@Module({
  imports: [MongooseModule.forFeature(featureModels)],
  exports: [MongooseModule],
})
export class FeatureModelsModule {}
