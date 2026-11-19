import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import type { ClientSession } from 'mongoose';
import { AuditWriter } from '../audit/audit-writer.service';
import { AuditAction, TransactionType } from '../common/enums';
import { Transaction } from './schemas/transaction.schema';
import { Wallet } from './schemas/wallet.schema';
import { STARTER_WALLET_BALANCE, WALLET_LEDGER_PAGE_SIZE } from './wallet.constants';

@Injectable()
export class WalletsService {
  private readonly starterCredit: number;

  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    @InjectConnection() private readonly connection: Connection,
    config: ConfigService,
    private readonly audit: AuditWriter,
  ) {
    const value = config.get<string>('STARTER_CREDIT');
    this.starterCredit = value === undefined ? STARTER_WALLET_BALANCE : Number(value);
    if (!Number.isSafeInteger(this.starterCredit) || this.starterCredit <= 0) {
      throw new Error('STARTER_CREDIT must be a positive whole-taka amount');
    }
  }

  getWallet(userId: Types.ObjectId, session?: ClientSession) {
    return this.walletModel.findOne({ userId }).session(session ?? null).exec();
  }

  async getOrCreateWallet(userId: Types.ObjectId) {
    const existing = await this.getWallet(userId);
    if (existing) return existing;

    await this.prepareWalletWrites();

    try {
      return await this.connection.transaction(session => this.createWallet(userId, session));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        // The winning transaction commits the wallet and its starter credit together.
        const wallet = await this.getWallet(userId);
        if (wallet) return wallet;
      }
      throw error;
    }
  }

  async prepareWalletWrites() {
    // Initialize collections and unique indexes before the first transaction.
    await Promise.all([this.walletModel.init(), this.transactionModel.init()]);
  }

  async ensureWallet(userId: Types.ObjectId, session: ClientSession) {
    this.requireTransaction(session);
    return (await this.getWallet(userId, session)) ?? this.createWallet(userId, session);
  }

  private async createWallet(userId: Types.ObjectId, session: ClientSession) {
    const [wallet] = await this.walletModel.create([{ userId, balance: 0 }], { session });
    const fundedWallet = await this.credit(userId, session);
    await this.audit.record({
      actor: { role: 'system' },
      action: AuditAction.WalletCreated,
      entityType: 'wallet',
      entityId: wallet._id,
    }, session);
    return fundedWallet;
  }

  async getSummary(userId: Types.ObjectId) {
    await this.getOrCreateWallet(userId);
    return this.connection.transaction(async (session) => {
      const wallet = await this.getWallet(userId, session);
      if (!wallet) throw new NotFoundException('Wallet not found');
      const transactions = await this.ledgerEntries(wallet._id, 0, 10).session(session).exec();
      return { balance: wallet.balance, transactions };
    }, { readConcern: { level: 'snapshot' } });
  }

  async getLedger(userId: Types.ObjectId, page: number) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.ledgerEntries(
      wallet._id, (page - 1) * WALLET_LEDGER_PAGE_SIZE, WALLET_LEDGER_PAGE_SIZE + 1,
    ).exec();
    return {
      page,
      pageSize: WALLET_LEDGER_PAGE_SIZE,
      hasNext: transactions.length > WALLET_LEDGER_PAGE_SIZE,
      transactions: transactions.slice(0, WALLET_LEDGER_PAGE_SIZE),
    };
  }

  private ledgerEntries(walletId: Types.ObjectId, offset: number, limit: number) {
    return this.transactionModel.find({ walletId })
      .select('_id type amount balanceAfter createdAt investmentId')
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  }

  // A wallet starts at zero. Its unique starter entry prevents a second credit.
  async credit(userId: Types.ObjectId, session: ClientSession) {
    this.requireTransaction(session);
    const wallet = await this.walletModel.findOneAndUpdate(
      { userId, balance: 0 },
      { $inc: { balance: this.starterCredit } },
      { returnDocument: 'after', session },
    ).exec();
    if (!wallet) throw new ConflictException('Starter credit requires an empty wallet');

    await this.transactionModel.create([{
      walletId: wallet._id, userId, type: TransactionType.StarterCredit,
      amount: this.starterCredit, balanceAfter: wallet.balance,
    }], { session });
    return wallet;
  }

  /** The purchase caller must abort its transaction if the debit fails. */
  async debit(userId: Types.ObjectId, amount: number, investmentId: Types.ObjectId, session: ClientSession) {
    this.requireTransaction(session);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new RangeError('Wallet debit must be a positive whole-taka amount');
    }

    const wallet = await this.walletModel.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { returnDocument: 'after', session },
    ).exec();
    if (!wallet) throw new ConflictException({ code: 'INSUFFICIENT_BALANCE', message: 'Your virtual wallet has insufficient funds.' });

    await this.transactionModel.create([{
      walletId: wallet._id, userId, type: TransactionType.InvestmentDebit,
      amount, balanceAfter: wallet.balance, investmentId,
    }], { session });
    return wallet;
  }

  private requireTransaction(session: ClientSession) {
    if (!session.inTransaction()) throw new Error('Wallet balance changes require an active transaction');
  }

  reconcile(userId: Types.ObjectId) {
    return this.connection.transaction(async (session) => {
      const wallet = await this.getWallet(userId, session);
      if (!wallet) throw new NotFoundException('Wallet not found');
      const totals = await this.transactionModel.aggregate<{ _id: TransactionType; total: number }>([
        { $match: { walletId: wallet._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]).session(session).exec();
      const credits = totals.find(({ _id }) => _id === TransactionType.StarterCredit)?.total ?? 0;
      const debits = totals.find(({ _id }) => _id === TransactionType.InvestmentDebit)?.total ?? 0;
      const ledgerBalance = credits - debits;
      return { balance: wallet.balance, credits, debits, ledgerBalance, reconciled: wallet.balance === ledgerBalance };
    }, { readConcern: { level: 'snapshot' } });
  }
}
