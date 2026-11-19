import { Controller, Get, Header, Param } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CampaignsService } from './campaigns.service';

@Controller('marketplace/campaigns')
export class MarketplaceCampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list() {
    return this.campaigns.listPublished();
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.campaigns.findPublished(id);
  }
}
