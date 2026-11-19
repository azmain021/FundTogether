import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserRole } from '../common/enums';
import { CampaignsService } from './campaigns.service';
import { CampaignReviewService } from './campaign-review.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';

@Controller('campaigns')
@UseGuards(SessionGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService, private readonly reviews: CampaignReviewService) {}

  @Post()
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: CurrentAccount) {
    return this.campaignsService.create(dto, user);
  }

  @Get(['mine', ''])
  @Roles(UserRole.BusinessOwner)
  findMine(@Query() query: ListCampaignsDto, @CurrentUser() user: CurrentAccount) {
    return this.campaignsService.findMine(user.id, query);
  }

  @Get(':id')
  @Roles(UserRole.BusinessOwner, UserRole.Admin)
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.reviews.detail(id, user);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  submit(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.reviews.submit(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateCampaignDto, @CurrentUser() user: CurrentAccount) {
    return this.campaignsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.campaignsService.remove(id, user);
  }
}
