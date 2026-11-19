import { Controller, Get, Header } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('marketplace/campaigns')
export class MarketplaceCampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list() {
    return this.campaigns.listPublished();
  }
}
