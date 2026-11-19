import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Connection, Model, Types } from 'mongoose';
import type { ClientSession } from 'mongoose';
import request from 'supertest';
import { AuditWriter } from '../audit/audit-writer.service';
import { SessionsService } from '../auth/sessions.service';
import { AuditAction, TransactionType, UserRole } from '../common/enums';
import { Transaction } from './schemas/transaction.schema';
import { Wallet } from './schemas/wallet.schema';
import { AdminWalletsController, WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

const userId = new Types.ObjectId();
const walletId = new Types.ObjectId();
const investmentId = new Types.ObjectId();

describe('Wallet API', () => {
  let app: INestApplication;
  const currentUser = jest.fn();
  const getSummary = jest.fn().mockResolvedValue({ balance: 100_000, transactions: [] });
  const getLedger = jest.fn().mockResolvedValue({ page: 2, hasNext: false, transactions: [] });
  const reconcile = jest.fn().mockResolvedValue({ reconciled: true });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [WalletsController, AdminWalletsController],
      providers: [
        { provide: SessionsService, useValue: { currentUser } },
        { provide: WalletsService, useValue: { getSummary, getLedger, reconcile } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => app.close());

  it('requires a session and restricts wallet reads to investors', async () => {
    currentUser.mockRejectedValueOnce(new UnauthorizedException());
    await request(app.getHttpServer()).get('/api/wallet/me').expect(401);
    currentUser.mockResolvedValue({ id: userId.toHexString(), role: UserRole.BusinessOwner });
    await request(app.getHttpServer()).get('/api/wallet/me').expect(403);
    expect(getSummary).not.toHaveBeenCalled();
  });

  it('reads the signed-in investor wallet and validates ledger pagination', async () => {
    currentUser.mockResolvedValue({ id: userId.toHexString(), role: UserRole.Investor });
    await request(app.getHttpServer()).get('/api/wallet/me').expect(200, { balance: 100_000, transactions: [] });
    await request(app.getHttpServer()).get('/api/wallets/me').expect(200);
    expect(getSummary).toHaveBeenCalledWith(userId);
    await request(app.getHttpServer()).get('/api/wallet/me/ledger?page=2').expect(200);
    expect(getLedger).toHaveBeenCalledWith(userId, 2);
    await request(app.getHttpServer()).get('/api/wallet/me/ledger?page=0').expect(400);
    await request(app.getHttpServer()).get('/api/wallet/me/ledger?page=1&page=2').expect(400);
    await request(app.getHttpServer()).patch('/api/wallet/me').send({ balance: 500 }).expect(404);
  });

  it('restricts reconciliation to admins and validates the target ID', async () => {
    const path = `/api/admin/wallets/${userId.toHexString()}/reconcile`;
    currentUser.mockResolvedValue({ id: userId.toHexString(), role: UserRole.Investor });
    await request(app.getHttpServer()).get(path).expect(403);
    currentUser.mockResolvedValue({ id: new Types.ObjectId().toHexString(), role: UserRole.Admin });
    await request(app.getHttpServer()).get('/api/admin/wallets/invalid/reconcile').expect(400);
    await request(app.getHttpServer()).get(path).expect(200, { reconciled: true });
    expect(reconcile).toHaveBeenCalledWith(userId);
  });
});

describe('Wallet balance and ledger', () => {
  const session = { inTransaction: () => true } as ClientSession;
  const wallet = { _id: walletId, balance: 25_000 };
  const findWallet = jest.fn();
  const updateWallet = jest.fn();
  const createWallet = jest.fn();
  const createEntry = jest.fn();
  const aggregate = jest.fn();
  const record = jest.fn();
  const transaction = jest.fn(async (callback: (session: ClientSession) => unknown) => callback(session));
  const wallets = new WalletsService(
    {
      init: jest.fn().mockResolvedValue(undefined),
      findOne: () => ({ session: () => ({ exec: findWallet }) }),
      create: createWallet,
      findOneAndUpdate: updateWallet,
    } as unknown as Model<Wallet>,
    {
      init: jest.fn().mockResolvedValue(undefined),
      create: createEntry,
      aggregate: () => ({ session: () => ({ exec: aggregate }) }),
    } as unknown as Model<Transaction>,
    { transaction } as unknown as Connection,
    new ConfigService({ STARTER_CREDIT: '25000' }),
    { record } as unknown as AuditWriter,
  );

  beforeEach(() => jest.clearAllMocks());

  it('records the configured starter credit and audit event once across repeated reads', async () => {
    findWallet.mockResolvedValueOnce(null).mockResolvedValueOnce(wallet);
    createWallet.mockResolvedValueOnce([{ _id: walletId, balance: 0 }]);
    updateWallet.mockReturnValueOnce({ exec: async () => wallet });

    await expect(wallets.getOrCreateWallet(userId)).resolves.toEqual(wallet);
    await expect(wallets.getOrCreateWallet(userId)).resolves.toEqual(wallet);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(createEntry).toHaveBeenCalledTimes(1);
    expect(createEntry).toHaveBeenCalledWith([{
      walletId, userId, type: TransactionType.StarterCredit, amount: 25_000, balanceAfter: 25_000,
    }], { session });
    expect(record).toHaveBeenCalledWith(expect.objectContaining({
      action: AuditAction.WalletCreated, entityId: walletId,
    }), session);
  });

  it('returns the winning wallet after a concurrent unique-index conflict', async () => {
    findWallet.mockResolvedValueOnce(null).mockResolvedValueOnce(wallet);
    createWallet.mockRejectedValueOnce(Object.assign(new Error('Duplicate userId'), { code: 11000 }));

    await expect(wallets.getOrCreateWallet(userId)).resolves.toEqual(wallet);
    expect(createEntry).not.toHaveBeenCalled();
  });

  it('guards the debit against insufficient funds and appends successful debits in the same session', async () => {
    updateWallet.mockReturnValueOnce({ exec: async () => null });
    await expect(wallets.debit(userId, 5_000, investmentId, session)).rejects.toMatchObject({ status: 409 });
    expect(createEntry).not.toHaveBeenCalled();

    const debited = { ...wallet, balance: 20_000 };
    updateWallet.mockReturnValueOnce({ exec: async () => debited });
    await expect(wallets.debit(userId, 5_000, investmentId, session)).resolves.toEqual(debited);
    expect(updateWallet).toHaveBeenLastCalledWith(
      { userId, balance: { $gte: 5_000 } }, { $inc: { balance: -5_000 } }, { returnDocument: 'after', session },
    );
    expect(createEntry).toHaveBeenLastCalledWith([{
      walletId, userId, type: TransactionType.InvestmentDebit, amount: 5_000, balanceAfter: 20_000, investmentId,
    }], { session });
  });

  it('reports whether the stored balance matches credits minus debits', async () => {
    findWallet.mockResolvedValueOnce({ ...wallet, balance: 20_000 }).mockResolvedValueOnce(wallet);
    const totals = [
      { _id: TransactionType.StarterCredit, total: 25_000 },
      { _id: TransactionType.InvestmentDebit, total: 5_000 },
    ];
    aggregate.mockResolvedValueOnce(totals).mockResolvedValueOnce(totals);
    await expect(wallets.reconcile(userId)).resolves.toMatchObject({ ledgerBalance: 20_000, reconciled: true });
    await expect(wallets.reconcile(userId)).resolves.toMatchObject({ ledgerBalance: 20_000, reconciled: false });
  });
});
