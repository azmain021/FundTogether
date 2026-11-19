import { Body, Controller, Header, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { SessionGuard } from '../auth/session.guard';
import { UserRole } from '../common/enums';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { InvestmentsService } from './investments.service';

@Controller('investments')
@UseGuards(SessionGuard)
export class InvestmentsController {
  constructor(private readonly investments: InvestmentsService) {}

  @Post()
  @Roles(UserRole.Investor)
  @UseGuards(SessionOriginGuard)
  @Header('Cache-Control', 'no-store')
  async purchase(
    @CurrentUser() user: CurrentAccount,
    @Body() dto: CreateInvestmentDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { replayed, receipt } = await this.investments.purchase(new Types.ObjectId(user.id), dto);
    response.status(replayed ? 200 : 201);
    return receipt;
  }
}
