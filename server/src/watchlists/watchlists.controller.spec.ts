import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import { SessionsService } from '../auth/sessions.service';
import { UserRole } from '../common/enums';
import { WatchlistsController } from './watchlists.controller';
import { WatchlistsService } from './watchlists.service';

describe('Watchlist API', () => {
  let app: INestApplication;

  const investorId = new Types.ObjectId();
  const campaignId = new Types.ObjectId();

  const currentUser = jest.fn();
  const list = jest.fn();
  const add = jest.fn();
  const remove = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [WatchlistsController],
      providers: [
        {
          provide: SessionsService,
          useValue: { currentUser },
        },
        {
          provide: WatchlistsService,
          useValue: { list, add, remove },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('requires an investor session', async () => {
    currentUser.mockRejectedValueOnce(
      new UnauthorizedException('Please log in to continue'),
    );

    await request(app.getHttpServer())
      .get('/api/watchlist')
      .expect(401);

    currentUser.mockResolvedValue({
      id: investorId.toHexString(),
      role: UserRole.BusinessOwner,
    });

    await request(app.getHttpServer())
      .get('/api/watchlist')
      .expect(403);

    expect(list).not.toHaveBeenCalled();
  });

  it('adds, reads, and removes the signed-in investor watchlist', async () => {
    currentUser.mockResolvedValue({
      id: investorId.toHexString(),
      role: UserRole.Investor,
    });

    add.mockResolvedValue({
      _id: new Types.ObjectId(),
      investorId,
      campaignId,
    });

    list.mockResolvedValue([]);
    remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .post('/api/watchlist')
      .send({ campaignId: campaignId.toHexString() })
      .expect(201);

    expect(add).toHaveBeenCalledWith(
      investorId,
      { campaignId: campaignId.toHexString() },
    );

    await request(app.getHttpServer())
      .get('/api/watchlist')
      .expect(200, []);

    expect(list).toHaveBeenCalledWith(investorId);

    await request(app.getHttpServer())
      .delete(`/api/watchlist/${campaignId.toHexString()}`)
      .expect(204);

    expect(remove).toHaveBeenCalledWith(investorId, campaignId);
  });

  it('rejects an invalid campaign ID', async () => {
    currentUser.mockResolvedValue({
      id: investorId.toHexString(),
      role: UserRole.Investor,
    });

    await request(app.getHttpServer())
      .post('/api/watchlist')
      .send({ campaignId: 'not-an-object-id' })
      .expect(400);

    expect(add).not.toHaveBeenCalled();
  });
});