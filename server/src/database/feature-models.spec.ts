import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, createConnection, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { DocumentReviewDecision, ReviewDecision, TransactionType } from '../common/enums';
import { CampaignReview } from '../campaigns/schemas/campaign-review.schema';
import { Investment } from '../investments/schemas/investment.schema';
import { DocumentReview } from '../onboarding/schemas/document-review.schema';
import { Transaction } from '../wallets/schemas/transaction.schema';
import { Wallet } from '../wallets/schemas/wallet.schema';

describe('Phase 0 database models', () => {
  let connection: Connection;
  let module: TestingModule;
  const id = new Types.ObjectId();

  beforeAll(async () => {
    connection = createConnection();
    module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => key === 'MONGODB_URI' ? 'mongodb://127.0.0.1:1' : undefined,
      })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      .compile();
  });

  afterAll(async () => {
    await module?.close();
    await connection.close();
  });

  it('registers every planned collection through AppModule', () => {
    const names = Object.values(connection.models).map(model => model.collection.name).sort();
    expect(names).toEqual([
      'analytics_reports', 'audit_events', 'business_applications', 'businesses',
      'campaign_reviews', 'campaign_revisions', 'campaigns', 'document_reviews', 'documents',
      'investments', 'notifications', 'password_resets', 'sessions', 'transactions',
      'users', 'wallets', 'watchlists',
    ]);
  });

  it('declares unique indexes for wallets, receipt numbers and repeat purchase protection', () => {
    expect(connection.model(Wallet.name).schema.indexes()).toContainEqual([
      { userId: 1 }, expect.objectContaining({ unique: true }),
    ]);
    expect(connection.model(Investment.name).schema.indexes()).toEqual(expect.arrayContaining([
      [{ receiptNumber: 1 }, expect.objectContaining({ unique: true })],
      [{ investorId: 1, idempotencyKey: 1 }, expect.objectContaining({ unique: true })],
    ]));
    expect(connection.model(Transaction.name).schema.indexes()).toEqual(expect.arrayContaining([
      [{ walletId: 1, type: 1 }, expect.objectContaining({
        unique: true, partialFilterExpression: { type: TransactionType.StarterCredit },
      })],
      [{ investmentId: 1 }, expect.objectContaining({
        unique: true, partialFilterExpression: { investmentId: { $type: 'objectId' } },
      })],
    ]));
  });

  it('rejects fractional wallet balances, mismatched investment totals and unlinked debits', async () => {
    const WalletModel = connection.model<Wallet>(Wallet.name);
    const InvestmentModel = connection.model<Investment>(Investment.name);
    const TransactionModel = connection.model<Transaction>(Transaction.name);
    await expect(new WalletModel({ userId: id, balance: 10.5 }).validate())
      .rejects.toHaveProperty('errors.balance');
    await expect(new InvestmentModel({
      investorId: id, campaignId: id, units: 2, unitPriceAtPurchase: 100,
      totalCost: 100, receiptNumber: 'FT-2026-000001',
      idempotencyKey: '779dfb95-d7a9-4668-834e-fc4a38920100',
    }).validate()).rejects.toHaveProperty('errors.totalCost');
    const debit = new TransactionModel({
      walletId: id, userId: id, type: TransactionType.InvestmentDebit, amount: 100, balanceAfter: 0,
    });
    await expect(debit.validate()).rejects.toHaveProperty('errors.investmentId');
    debit.investmentId = id;
    await expect(debit.validate()).resolves.toBeUndefined();
  });

  it('requires feedback on campaign rejection and notes on document correction', async () => {
    const CampaignReviewModel = connection.model<CampaignReview>(CampaignReview.name);
    const DocumentReviewModel = connection.model<DocumentReview>(DocumentReview.name);
    await expect(new CampaignReviewModel({
      campaignId: id, reviewerId: id, version: 1, decision: ReviewDecision.Rejected, feedback: '  ',
    }).validate()).rejects.toHaveProperty('errors.feedback');
    await expect(new DocumentReviewModel({
      documentId: id, applicationId: id, reviewerId: id,
      decision: DocumentReviewDecision.ReplacementRequested,
    }).validate()).rejects.toHaveProperty('errors.note');
  });
});
