
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessesModule } from './businesses/businesses.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { FeatureModelsModule } from './database/feature-models.module';
import { WalletsModule } from './wallets/wallets.module';
import { InvestmentsModule } from './investments/investments.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI')?.trim();
        if (!uri) {
          throw new Error('Set MONGODB_URI in server/.env before starting the API.');
        }
        return { uri, dbName: config.get<string>('MONGODB_DATABASE')?.trim() || 'fundtogether' };
      },
    }),
    BusinessesModule,
    AuthModule,
    UsersModule,
    CampaignsModule,
    OnboardingModule,
    FeatureModelsModule,
    WalletsModule,
    InvestmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
