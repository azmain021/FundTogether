import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { Roles } from '../auth/roles.guard';
import { UserRole } from '../common/enums';
import { SessionGuard } from '../auth/session.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentAccount } from '../auth/current-user.decorator';
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
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1, fields: 2, parts: 3 } }))
  upload(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() dto: UploadDocumentDto, @UploadedFile() file: UploadedDocument, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.upload(id, dto, file, user);
  }

  @Get('businesses/:id/documents')
  @Header('Cache-Control', 'no-store')
  list(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.list(id, user);
  }

  @Get('documents/:id/download')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async download(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    const document = await this.onboarding.download(id, user);
    return new StreamableFile(document.stream, {
      type: document.mimeType,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
    });
  }

  @Delete('documents/:id')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.remove(id, user);
  }

  @Get('businesses/:id/eligibility')
  @Roles(UserRole.BusinessOwner)
  eligibility(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.eligibility(id, user);
  }

  @Post('businesses/:id/applications')
  @Roles(UserRole.BusinessOwner)
  @UseGuards(SessionOriginGuard)
  submit(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.submit(id, user);
  }

  @Get('businesses/:id/applications/current')
  @Header('Cache-Control', 'no-store')
  current(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.current(id, user);
  }

  @Get('businesses/:id/applications')
  history(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @CurrentUser() user: CurrentAccount) {
    return this.onboarding.history(id, user);
  }
}
