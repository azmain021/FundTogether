import { Body, Controller, Get, Header, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { UserRole } from '../common/enums';
import { CampaignReviewService } from './campaign-review.service';
import { CampaignReviewQueueDto, ReviewCampaignDto } from './dto/review-campaign.dto';

@Controller('admin/campaigns')
@UseGuards(SessionGuard)
export class AdminCampaignsController {
  constructor(private readonly reviews: CampaignReviewService) {}

  @Get()
  @Roles(UserRole.Admin)
  @Header('Cache-Control', 'no-store')
  queue(@Query() _query: CampaignReviewQueueDto) {
    return this.reviews.queue();
  }

  @Patch(':id/review')
  @Roles(UserRole.Admin)
  @UseGuards(SessionOriginGuard)
  decide(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: ReviewCampaignDto, @CurrentUser() user: CurrentAccount) {
    return this.reviews.decide(id, dto, user);
  }
}
