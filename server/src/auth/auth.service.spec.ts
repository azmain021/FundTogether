import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { UserRole } from '../common/enums';
import { User } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { RegisterBusinessOwnerDto } from './dto/register-business-owner.dto';
import { PasswordResetService } from './password-reset.service';

describe('AuthService business owner registration', () => {
  const dto: RegisterBusinessOwnerDto = {
    fullName: 'Test Owner',
    email: 'Owner@Example.com',
    phone: '01712345678',
    password: 'test-registration-password',
    acceptedTerms: true,
  };

  function setup(existing: unknown = null) {
    const session = {} as ClientSession;
    const connection = { transaction: jest.fn((work: (session: ClientSession) => Promise<unknown>) => work(session)) };
    const passwords = { issueCode: jest.fn().mockResolvedValue('synthetic-recovery-code') };
    const model = {
      findOne: jest.fn().mockReturnValue({ exec: async () => existing }),
      create: jest.fn().mockImplementation(async ([data]: Record<string, unknown>[]) => [{
        ...data,
        _id: new Types.ObjectId(),
        isActive: true,
      }]),
    };
    const service = new AuthService(
      model as unknown as Model<User>, connection as unknown as Connection, passwords as unknown as PasswordResetService,
    );
    return { service, model, passwords, session };
  }

  it('normalizes the email, hashes the password and assigns the owner role', async () => {
    const { service, model, passwords, session } = setup();
    const account = await service.registerBusinessOwner(dto);
    const [stored] = model.create.mock.calls[0][0] as Record<string, unknown>[];

    expect(model.findOne).toHaveBeenCalledWith({ email: 'owner@example.com' });
    expect(stored).toMatchObject({
      displayName: dto.fullName,
      email: 'owner@example.com',
      phone: dto.phone,
      role: UserRole.BusinessOwner,
    });
    expect(await argon2.verify(stored.passwordHash as string, dto.password)).toBe(true);
    expect(stored).not.toHaveProperty('password');
    expect(account).toMatchObject({
      email: 'owner@example.com', role: UserRole.BusinessOwner, recoveryCode: 'synthetic-recovery-code',
    });
    expect(passwords.issueCode).toHaveBeenCalledWith(new Types.ObjectId(account.id), session);
    expect(account).not.toHaveProperty('passwordHash');
    expect(account).not.toHaveProperty('password');
  });

  it('rejects an email that already has an account', async () => {
    const { service, model } = setup({ email: 'owner@example.com' });
    await expect(service.registerBusinessOwner(dto)).rejects.toThrow(ConflictException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('assigns the investor role on the investor registration path', async () => {
    const { service, model } = setup();
    await expect(service.registerInvestor(dto)).resolves.toMatchObject({ role: UserRole.Investor });
    expect(model.create).toHaveBeenCalledWith([expect.objectContaining({ role: UserRole.Investor })], expect.anything());
  });

  it('handles a duplicate email inserted by another request', async () => {
    const { service, model } = setup();
    model.create.mockRejectedValueOnce({ code: 11000 });
    await expect(service.registerBusinessOwner(dto)).rejects.toThrow(ConflictException);
  });

  it('does not turn other database failures into duplicate email errors', async () => {
    const { service, model } = setup();
    const failure = new Error('Database unavailable');
    model.create.mockRejectedValueOnce(failure);
    await expect(service.registerBusinessOwner(dto)).rejects.toThrow(failure);
  });
});

describe('AuthService login', () => {
  let passwordHash: string;
  beforeAll(async () => {
    passwordHash = await argon2.hash('correct-test-password', { type: argon2.argon2id });
  });

  function setup(user: unknown) {
    const exec = jest.fn().mockResolvedValue(user);
    const select = jest.fn().mockReturnValue({ exec });
    const model = { findOne: jest.fn().mockReturnValue({ select }) };
    const service = new AuthService(model as unknown as Model<User>, {} as Connection, {} as PasswordResetService);
    return { model, select, service };
  }

  const account = () => ({
    _id: new Types.ObjectId(), displayName: 'Test Owner',
    email: 'owner@example.com', phone: '01712345678',
    role: UserRole.BusinessOwner, isActive: true, passwordHash,
  });

  it('verifies the password and returns only public account details', async () => {
    const { model, select, service } = setup(account());
    const result = await service.login({ email: ' Owner@Example.com ', password: 'correct-test-password' });
    expect(model.findOne).toHaveBeenCalledWith({ email: 'owner@example.com' });
    expect(select).toHaveBeenCalledWith('+passwordHash');
    expect(result.user).toMatchObject({ role: UserRole.BusinessOwner, email: 'owner@example.com' });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.credentialVersion).toBe(0);
  });

  it('rejects the wrong password', async () => {
    const { service } = setup(account());
    await expect(service.login({ email: 'owner@example.com', password: 'wrong-password' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('uses the same error for a missing account and a disabled account', async () => {
    for (const user of [null, { ...account(), isActive: false }]) {
      const { service } = setup(user);
      await expect(service.login({ email: 'owner@example.com', password: 'correct-test-password' }))
        .rejects.toThrow('Invalid email or password');
    }
  });
});
