import { Connection, mongo, Types } from 'mongoose';
import { TransactionType } from '../common/enums';
import { Transaction } from '../wallets/schemas/transaction.schema';
import { Wallet } from '../wallets/schemas/wallet.schema';
import { verifyDatabaseIndexes } from './migrate';

export async function verifyDatabase(connection: Connection) {
  await verifyDatabaseIndexes(connection);
  const walletModel = connection.model<Wallet>(Wallet.name);
  const transactionModel = connection.model<Transaction>(Transaction.name);
  const userId = new Types.ObjectId();
  const walletId = new Types.ObjectId();
  const session = await connection.startSession();

  try {
    session.startTransaction();
    await walletModel.create([{ _id: walletId, userId, balance: 100 }], { session });
    await transactionModel.create([{
      walletId, userId, type: TransactionType.StarterCredit, amount: 100, balanceAfter: 100,
    }], { session });
    const transaction = await transactionModel.exists({ walletId }).session(session);
    if (!transaction) throw new Error('Transaction could not read its own ledger write.');
    await session.abortTransaction();

    session.startTransaction();
    await walletModel.create([{ _id: walletId, userId, balance: 100 }], { session });
    try {
      await walletModel.create([{ userId, balance: 100 }], { session });
      throw new Error('MongoDB accepted a duplicate wallet for the same user.');
    } catch (error) {
      if (!(error instanceof mongo.MongoServerError) || error.code !== 11000) throw error;
    }
  } finally {
    try {
      if (session.inTransaction()) await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }
  const [wallet, ledger] = await Promise.all([
    walletModel.exists({ userId }), transactionModel.exists({ walletId }),
  ]);
  if (wallet || ledger) throw new Error('Transaction probe records survived rollback.');
}
