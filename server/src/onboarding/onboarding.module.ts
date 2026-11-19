import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { BusinessApplication, BusinessApplicationSchema, VerificationDocument, VerificationDocumentSchema } from './schemas/onboarding.schema';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule, AuthModule, BusinessesModule, MongooseModule.forFeature([
    { name: VerificationDocument.name, schema: VerificationDocumentSchema },
    { name: BusinessApplication.name, schema: BusinessApplicationSchema },
  ])],
  controllers: [OnboardingController],
  providers: [OnboardingService, StorageService],
})
export class OnboardingModule {}
