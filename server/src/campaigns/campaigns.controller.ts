import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  // Optional ?businessId= filter.
  @Get()
  findAll(@Query('businessId') businessId?: string) {
    return this.campaignsService.findAll(
      businessId === undefined ? undefined : new ParseObjectIdPipe().transform(businessId),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.campaignsService.remove(id);
  }
}
