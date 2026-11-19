import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userModels } from '../database/model-definitions';

// Registers the User model. Controllers/services for /users arrive with the
// auth and onboarding work (Phase 0); other modules reference users by ObjectId.
@Module({
  imports: [MongooseModule.forFeature(userModels)],
  exports: [MongooseModule],
})
export class UsersModule {}
