import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { authModels } from '../database/model-definitions';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { SessionsService } from './sessions.service';
import { SessionOriginGuard } from './session-origin.guard';
import { SessionGuard } from './session.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature(authModels),
    ThrottlerModule.forRoot([{ limit: 30, ttl: 900_000 }]),
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [
    AuthService, SessionsService, SessionOriginGuard, SessionGuard,
    PasswordResetService,
  ],
  exports: [AuthService, SessionsService, SessionGuard, SessionOriginGuard],
})
export class AuthModule {}
