import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { onboardingModels } from '../database/model-definitions';
import { AuthModule } from '../auth/auth.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule, AuthModule, BusinessesModule, MongooseModule.forFeature(onboardingModels)],
  controllers: [OnboardingController],
  providers: [OnboardingService, StorageService],
})
export class OnboardingModule {}
