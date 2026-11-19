import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { ApiExceptionFilter } from '../common/api-exception.filter';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { SESSION_COOKIE, SessionsService } from './sessions.service';

describe('Password recovery API', () => {
  let app: INestApplication;
  const passwords = { reset: jest.fn(), rotate: jest.fn() };
  const sessions = { currentUser: jest.fn() };
  const resetPath = '/api/auth/reset-password';
  const rotationPath = '/api/auth/recovery-code';
  const email = 'investor@example.com';
  const password = 'a-valid-test-password';
  const recoveryCode = 'ABCDEF01-23456789-ABCDEF01-23456789';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ limit: 30, ttl: 60_000 }])],
      controllers: [PasswordResetController],
      providers: [
        { provide: PasswordResetService, useValue: passwords },
        { provide: SessionsService, useValue: sessions },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, forbidNonWhitelisted: true, transform: true,
    }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('rejects a password reset without a recovery code', async () => {
    const response = await request(app.getHttpServer()).post(resetPath)
      .send({ email, password }).expect(400);
    expect(response.body).toMatchObject({ statusCode: 400, code: 'BAD_REQUEST', path: resetPath });
    expect(passwords.reset).not.toHaveBeenCalled();
  });

  it('normalizes a recovery code and resets the password in one request', async () => {
    await request(app.getHttpServer()).post(resetPath).send({ email, recoveryCode, password })
      .expect(204).expect('Cache-Control', 'no-store').expect('');
    expect(passwords.reset).toHaveBeenCalledWith(email, recoveryCode.toLowerCase().replaceAll('-', ''), password);
  });

  it('requires a valid session to generate a recovery code', async () => {
    sessions.currentUser.mockRejectedValueOnce(new UnauthorizedException());
    await request(app.getHttpServer()).post(rotationPath).send({ currentPassword: password }).expect(401);
    expect(passwords.rotate).not.toHaveBeenCalled();
  });

  it('generates a recovery code for the signed-in account only', async () => {
    sessions.currentUser.mockResolvedValueOnce({ id: 'signed-in-user' });
    passwords.rotate.mockResolvedValueOnce(recoveryCode);
    await request(app.getHttpServer()).post(rotationPath)
      .set('Cookie', `${SESSION_COOKIE}=${'a'.repeat(64)}`)
      .send({ currentPassword: password }).expect(200).expect('Cache-Control', 'no-store')
      .expect({ recoveryCode });
    expect(passwords.rotate).toHaveBeenCalledWith('signed-in-user', password);
  });
});
