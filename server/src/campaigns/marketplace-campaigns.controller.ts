import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CampaignsService } from './campaigns.service';
import { ListMarketplaceCampaignsDto } from './dto/list-marketplace-campaigns.dto';

@Controller('marketplace/campaigns')
export class MarketplaceCampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Query() query: ListMarketplaceCampaignsDto) {
    return this.campaigns.listPublished(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  detail(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.campaigns.findPublished(id);
  }
}