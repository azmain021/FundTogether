import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Session } from './schemas/session.schema';
import { SESSION_COOKIE, SESSION_DURATION_MS, SessionsService, sessionToken } from './sessions.service';

describe('SessionsService', () => {
  function setup() {
    const sessions = {
      create: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockReturnValue({ exec: async () => null }),
      deleteOne: jest.fn().mockReturnValue({ exec: async () => ({ deletedCount: 1 }) }),
    };
    const users = { findById: jest.fn().mockReturnValue({ exec: async () => null }) };
    return { sessions, users, service: new SessionsService(sessions as unknown as Model<Session>, users as unknown as Model<User>) };
  }

  it('stores only a hash of a random session token and sets an expiry', async () => {
    const { service, sessions } = setup();
    const before = Date.now();
    const token = await service.create(new Types.ObjectId().toString());
    const stored = sessions.create.mock.calls[0][0];
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.tokenHash).toBe(createHash('sha256').update(token).digest('hex'));
    expect(stored.tokenHash).not.toBe(token);
    expect(stored.expiresAt.getTime()).toBeGreaterThanOrEqual(before + SESSION_DURATION_MS);
  });

  it('rejects missing and expired sessions', async () => {
    const { service, sessions } = setup();
    await expect(service.currentUser(undefined)).rejects.toThrow(UnauthorizedException);
    await expect(service.currentUser('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
    expect(sessions.findOne).toHaveBeenCalledWith(expect.objectContaining({
      expiresAt: { $gt: expect.any(Date) },
    }));
  });

  it('rejects an inactive account even if its session exists', async () => {
    const { service, sessions, users } = setup();
    sessions.findOne.mockReturnValueOnce({ exec: async () => ({ userId: new Types.ObjectId() }) });
    users.findById.mockReturnValueOnce({ exec: async () => ({ isActive: false }) });
    await expect(service.currentUser('a'.repeat(64))).rejects.toThrow(UnauthorizedException);
  });

  it('revokes by token hash and tolerates logout without a cookie', async () => {
    const { service, sessions } = setup();
    await service.revoke(undefined);
    expect(sessions.deleteOne).not.toHaveBeenCalled();
    const token = 'b'.repeat(64);
    await service.revoke(token);
    expect(sessions.deleteOne).toHaveBeenCalledWith({ tokenHash: createHash('sha256').update(token).digest('hex') });
  });

  it('only accepts correctly formed session cookies', () => {
    expect(sessionToken(undefined)).toBeUndefined();
    expect(sessionToken(`${SESSION_COOKIE}=invalid`)).toBeUndefined();
    const token = 'c'.repeat(64);
    expect(sessionToken(`other=x; ${SESSION_COOKIE}=${token}; another=y`)).toBe(token);
  });
});
