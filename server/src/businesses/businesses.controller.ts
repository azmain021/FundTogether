import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.guard';
import { UserRole } from '../common/enums';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

// Controller: maps HTTP requests to BusinessesService. Validation happens in
// the DTOs (global ValidationPipe); business rules live in the service.
@Controller('businesses')
@UseGuards(SessionGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  create(@Body() dto: CreateBusinessDto, @CurrentUser() user: CurrentAccount) {
    return this.businessesService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentAccount) {
    return this.businessesService.findAll(user);
  }

  @Get('me')
  @Roles(UserRole.BusinessOwner)
  me(@CurrentUser() user: CurrentAccount) {
    return this.businessesService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.businessesService.findForUser(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateBusinessDto, @CurrentUser() user: CurrentAccount) {
    return this.businessesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.businessesService.remove(id, user);
  }
}
