import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

// Registers the User model. Controllers/services for /users arrive with the
// auth and onboarding work (Phase 0); other modules reference users by ObjectId.
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  exports: [MongooseModule],
})
export class UsersModule {}
