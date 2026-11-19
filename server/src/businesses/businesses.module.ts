import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Business, BusinessSchema } from './schemas/business.schema';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, MongooseModule],
})
export class BusinessesModule {}
