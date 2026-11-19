import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditWriter } from '../audit/audit-writer.service';
import { AuthModule } from '../auth/auth.module';
import { FeatureModelsModule } from '../database/feature-models.module';
import { AdminWalletsController, WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [FeatureModelsModule, AuthModule, ConfigModule],
  controllers: [WalletsController, AdminWalletsController],
  providers: [WalletsService, AuditWriter],
  exports: [WalletsService],
})
export class WalletsModule {}
