import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionsService } from './sessions.service';
import { SessionOriginGuard } from './session-origin.guard';
import { SessionGuard } from './session.guard';
import { BusinessOwnerGuard } from './business-owner.guard';

@Module({
  imports: [ConfigModule, UsersModule, MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, SessionOriginGuard, SessionGuard, BusinessOwnerGuard],
  exports: [AuthService, SessionsService, SessionGuard, SessionOriginGuard, BusinessOwnerGuard],
})
export class AuthModule {}
