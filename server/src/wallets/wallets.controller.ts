import {
  BadRequestException, Controller, Get, Header, Param, Query, UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { UserRole } from '../common/enums';
import { WALLET_LEDGER_PAGE_SIZE } from './wallet.constants';
import { WalletsService } from './wallets.service';

@Controller(['wallet', 'wallets'])
@UseGuards(SessionGuard)
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}

  @Header('Cache-Control', 'no-store')
  @Get('me')
  @Roles(UserRole.Investor)
  getMyWallet(@CurrentUser() user: CurrentAccount) {
    return this.wallets.getSummary(new Types.ObjectId(user.id));
  }

  @Header('Cache-Control', 'no-store')
  @Get('me/ledger')
  @Roles(UserRole.Investor)
  getMyLedger(@CurrentUser() user: CurrentAccount, @Query('page') page = '1') {
    const pageNumber = Number(page);
    if (typeof page !== 'string' || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(pageNumber * WALLET_LEDGER_PAGE_SIZE)) {
      throw new BadRequestException('page must be a positive integer within range');
    }
    return this.wallets.getLedger(new Types.ObjectId(user.id), pageNumber);
  }
}

@Controller('admin/wallets')
@UseGuards(SessionGuard)
export class AdminWalletsController {
  constructor(private readonly wallets: WalletsService) {}

  @Header('Cache-Control', 'no-store')
  @Get(':userId/reconcile')
  @Roles(UserRole.Admin)
  reconcile(@Param('userId', ParseObjectIdPipe) userId: Types.ObjectId) {
    return this.wallets.reconcile(userId);
  }
}
