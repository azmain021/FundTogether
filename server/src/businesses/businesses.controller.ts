import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/session.guard';
import type { AuthenticatedRequest } from '../auth/session.guard';
import { BusinessOwnerGuard } from '../auth/business-owner.guard';
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
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  create(@Body() dto: CreateBusinessDto, @Req() request: AuthenticatedRequest) {
    return this.businessesService.create(dto, request.user.id);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.businessesService.findAll(request.user);
  }

  @Get('me')
  @UseGuards(BusinessOwnerGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.businessesService.findMine(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.businessesService.findForUser(id, request.user);
  }

  @Patch(':id')
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateBusinessDto, @Req() request: AuthenticatedRequest) {
    return this.businessesService.update(id, dto, request.user);
  }

  @Delete(':id')
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.businessesService.remove(id, request.user);
  }
}
