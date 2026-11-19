import { ConflictException, INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SESSION_COOKIE, SessionsService } from './sessions.service';

describe('Business owner registration API', () => {
  let app: INestApplication;
  const registerBusinessOwner = jest.fn();
  const login = jest.fn();
  const sessions = { create: jest.fn(), revoke: jest.fn(), currentUser: jest.fn() };
  const account = { id: 'test-user-id', email: 'owner@example.com', role: 'business_owner' };
  const payload = {
    fullName: 'Test Owner',
    email: 'owner@example.com',
    password: 'test-registration-password',
    phone: '+880 1712-345678',
    acceptedTerms: true,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { registerBusinessOwner, login } },
        { provide: SessionsService, useValue: sessions },
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  beforeEach(() => {
    registerBusinessOwner.mockReset();
    login.mockReset();
    Object.values(sessions).forEach(mock => mock.mockReset());
  });
  afterAll(async () => app.close());

  it('accepts valid data and returns the created account', async () => {
    const account = { id: 'test-user-id', email: payload.email, role: 'business_owner' };
    registerBusinessOwner.mockResolvedValueOnce(account);
    await request(app.getHttpServer())
      .post('/api/auth/register/business-owner')
      .send(payload)
      .expect(201)
      .expect(account);
    expect(registerBusinessOwner).toHaveBeenCalledWith(expect.objectContaining({
      phone: '+8801712345678',
    }));
  });

  it.each([
    { password: 'short' },
    { email: 'invalid-email' },
    { phone: '123' },
    { acceptedTerms: false },
    { fullName: '   ' },
    { role: 'admin' },
  ])('rejects invalid or unauthorized input: %j', async (override) => {
    await request(app.getHttpServer())
      .post('/api/auth/register/business-owner')
      .send({ ...payload, ...override })
      .expect(400);
    expect(registerBusinessOwner).not.toHaveBeenCalled();
  });

  it('returns 409 for a duplicate email', async () => {
    registerBusinessOwner.mockRejectedValueOnce(new ConflictException('Email already exists'));
    await request(app.getHttpServer())
      .post('/api/auth/register/business-owner')
      .send(payload)
      .expect(409);
  });

  it('logs in and sets a session cookie without exposing the token in the body', async () => {
    login.mockResolvedValueOnce(account);
    sessions.create.mockResolvedValueOnce('a'.repeat(64));
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'http://127.0.0.1:5173')
      .send({ email: payload.email, password: payload.password })
      .expect(200);
    expect(response.body).toEqual(account);
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(response.headers['set-cookie'][0]).toContain('SameSite=Lax');
    expect(response.headers['set-cookie'][0]).toContain('Path=/api');
  });

  it('rejects a browser login from an untrusted origin', async () => {
    await request(app.getHttpServer()).post('/api/auth/login')
      .set('Origin', 'https://untrusted.example')
      .send({ email: payload.email, password: payload.password }).expect(403);
    expect(login).not.toHaveBeenCalled();
  });

  it('returns 401 and no cookie for invalid credentials', async () => {
    login.mockRejectedValueOnce(new UnauthorizedException('Invalid email or password'));
    const response = await request(app.getHttpServer()).post('/api/auth/login')
      .send({ email: payload.email, password: 'wrong-password' }).expect(401);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(sessions.create).not.toHaveBeenCalled();
  });

  it('returns the current account with caching disabled', async () => {
    sessions.currentUser.mockResolvedValueOnce(account);
    const token = 'b'.repeat(64);
    await request(app.getHttpServer()).get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE}=${token}`).expect('Cache-Control', 'no-store')
      .expect(200).expect(account);
    expect(sessions.currentUser).toHaveBeenCalledWith(token);
  });

  it('returns 401 when there is no valid session', async () => {
    sessions.currentUser.mockRejectedValueOnce(new UnauthorizedException());
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('revokes the session and clears the cookie on logout', async () => {
    const token = 'c'.repeat(64);
    const response = await request(app.getHttpServer()).post('/api/auth/logout')
      .set('Cookie', `${SESSION_COOKIE}=${token}`).expect(204);
    expect(sessions.revoke).toHaveBeenCalledWith(token);
    expect(response.headers['set-cookie'][0]).toContain(`${SESSION_COOKIE}=;`);
  });
});
