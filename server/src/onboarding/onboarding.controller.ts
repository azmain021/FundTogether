import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Req, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { BusinessOwnerGuard } from '../auth/business-owner.guard';
import { SessionGuard } from '../auth/session.guard';
import type { AuthenticatedRequest } from '../auth/session.guard';
import { SessionOriginGuard } from '../auth/session-origin.guard';
import { MAX_DOCUMENT_BYTES } from './document-types';
import type { UploadedDocument } from './document-types';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { OnboardingService } from './onboarding.service';

@Controller()
@UseGuards(SessionGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('businesses/:id/documents')
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1, fields: 2, parts: 3 } }))
  upload(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UploadDocumentDto, @UploadedFile() file: UploadedDocument, @Req() request: AuthenticatedRequest) {
    return this.onboarding.upload(id, dto, file, request.user);
  }

  @Get('businesses/:id/documents')
  @Header('Cache-Control', 'no-store')
  list(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.list(id, request.user);
  }

  @Get('documents/:id/download')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async download(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    const document = await this.onboarding.download(id, request.user);
    return new StreamableFile(document.bytes, {
      type: document.mimeType,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
    });
  }

  @Delete('documents/:id')
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.remove(id, request.user);
  }

  @Get('businesses/:id/eligibility')
  @UseGuards(BusinessOwnerGuard)
  eligibility(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.eligibility(id, request.user);
  }

  @Post('businesses/:id/applications')
  @UseGuards(BusinessOwnerGuard, SessionOriginGuard)
  submit(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.submit(id, request.user);
  }

  @Get('businesses/:id/applications/current')
  @Header('Cache-Control', 'no-store')
  current(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.current(id, request.user);
  }

  @Get('businesses/:id/applications')
  history(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() request: AuthenticatedRequest) {
    return this.onboarding.history(id, request.user);
  }
}
