import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { SessionsService } from '../auth/sessions.service';
import { UserRole } from '../common/enums';
import { MAX_DOCUMENT_BYTES } from './document-types';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

describe('Document upload HTTP endpoint', () => {
  let app: INestApplication;
  const upload = jest.fn();
  const currentUser = jest.fn();
  const owner = { id: new Types.ObjectId().toString(), role: UserRole.BusinessOwner };
  const path = `/api/businesses/${new Types.ObjectId()}/documents`;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        { provide: OnboardingService, useValue: { upload } },
        { provide: SessionsService, useValue: { currentUser } },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });
  beforeEach(() => { upload.mockReset(); currentUser.mockReset(); currentUser.mockResolvedValue(owner); });
  afterAll(async () => app.close());

  it('accepts multipart upload metadata and the file', async () => {
    upload.mockResolvedValue({ _id: 'document-id', type: 'trade_licence' });
    await request(app.getHttpServer()).post(path).field('type', 'trade_licence')
      .attach('file', Buffer.from('%PDF-1.4 synthetic'), { filename: 'demo.pdf', contentType: 'application/pdf' })
      .expect(201).expect({ _id: 'document-id', type: 'trade_licence' });
    expect(upload).toHaveBeenCalledWith(expect.any(Types.ObjectId), expect.objectContaining({ type: 'trade_licence' }), expect.objectContaining({ mimetype: 'application/pdf' }), owner);
  });

  it('rejects an upload without login', async () => {
    currentUser.mockRejectedValueOnce(new UnauthorizedException());
    await request(app.getHttpServer()).post(path).field('type', 'trade_licence').expect(401);
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects an investor uploading business documents', async () => {
    currentUser.mockResolvedValueOnce({ ...owner, role: UserRole.Investor });
    await request(app.getHttpServer()).post(path).field('type', 'trade_licence').expect(403);
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects unknown document types', async () => {
    await request(app.getHttpServer()).post(path).field('type', 'arbitrary')
      .attach('file', Buffer.from('%PDF-1.4'), { filename: 'demo.pdf' }).expect(400);
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects files over 5 MB before calling the service', async () => {
    await request(app.getHttpServer()).post(path).field('type', 'trade_licence')
      .attach('file', Buffer.alloc(MAX_DOCUMENT_BYTES + 1), { filename: 'demo.pdf', contentType: 'application/pdf' }).expect(413);
    expect(upload).not.toHaveBeenCalled();
  });
});
