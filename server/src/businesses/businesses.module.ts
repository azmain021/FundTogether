import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { businessModels } from '../database/model-definitions';
import { AuthModule } from '../auth/auth.module';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature(businessModels)],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, MongooseModule],
})
export class BusinessesModule {}
