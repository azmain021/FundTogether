import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

// Controller: maps HTTP requests to BusinessesService. Validation happens in
// the DTOs (global ValidationPipe); business rules live in the service.
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@Body() dto: CreateBusinessDto) {
    return this.businessesService.create(dto);
  }

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.businessesService.remove(id);
  }
}
