import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { UserRole } from '../common/enums';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { WatchlistsService } from './watchlists.service';

@Controller('watchlist')
@UseGuards(SessionGuard)
export class WatchlistsController {
  constructor(private readonly watchlists: WatchlistsService) {}

  @Get()
  @Roles(UserRole.Investor)
  @Header('Cache-Control', 'no-store')
  list(@CurrentUser() user: CurrentAccount) {
    return this.watchlists.list(new Types.ObjectId(user.id));
  }

  @Post()
  @Roles(UserRole.Investor)
  @UseGuards(SessionOriginGuard)
  @Header('Cache-Control', 'no-store')
  add(
    @CurrentUser() user: CurrentAccount,
    @Body() dto: CreateWatchlistDto,
  ) {
    return this.watchlists.add(new Types.ObjectId(user.id), dto);
  }

  @Delete(':campaignId')
  @Roles(UserRole.Investor)
  @UseGuards(SessionOriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: CurrentAccount,
    @Param('campaignId', ParseObjectIdPipe) campaignId: Types.ObjectId,
  ): Promise<void> {
    await this.watchlists.remove(new Types.ObjectId(user.id), campaignId);
  }
}