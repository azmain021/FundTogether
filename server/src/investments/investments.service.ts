import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, mongo, Types } from 'mongoose';
import type { ClientSession } from 'mongoose';
import { AuditWriter } from '../audit/audit-writer.service';
import { Business } from '../businesses/schemas/business.schema';
import { CampaignLifecycleService } from '../campaigns/campaign-lifecycle.service';
import { Campaign } from '../campaigns/schemas/campaign.schema';
import { AuditAction, TransactionType, UserRole } from '../common/enums';
import { Transaction } from '../wallets/schemas/transaction.schema';
import { WalletsService } from '../wallets/wallets.service';
import type { CreateInvestmentDto } from './dto/create-investment.dto';
import { InvestmentDelivery } from './investment-delivery.service';
import { Investment } from './schemas/investment.schema';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Investment.name) private readonly investments: Model<Investment>,
    @InjectModel(Transaction.name) private readonly transactions: Model<Transaction>,
    @InjectModel(Campaign.name) private readonly campaigns: Model<Campaign>,
    @InjectModel(Business.name) private readonly businesses: Model<Business>,
    private readonly lifecycle: CampaignLifecycleService,
    private readonly wallets: WalletsService,
    private readonly audit: AuditWriter,
    private readonly delivery: InvestmentDelivery,
  ) {}

  async purchase(investorId: Types.ObjectId, dto: CreateInvestmentDto) {
    await Promise.all([this.investments.init(), this.wallets.prepareWalletWrites()]);
    const campaignId = new Types.ObjectId(dto.campaignId);
    const investmentId = new Types.ObjectId();
    const ownerNotificationId = new Types.ObjectId();
    const identity = { investorId, idempotencyKey: dto.idempotencyKey };

    const transact = () => this.connection.transaction(async session => {
      const existing = await this.investments.findOne(identity).session(session).exec();
      if (existing) return this.replay(existing, campaignId, dto.units, session);

      const now = new Date();
      const campaign = await this.lifecycle.reserveUnits(campaignId, dto.units, now, session);
      const totalCost = dto.units * campaign.unitPrice;
      if (!Number.isSafeInteger(totalCost) || totalCost <= 0) {
        throw new ConflictException({ code: 'INVALID_CAMPAIGN_PRICE', message: 'This campaign has an invalid unit price.' });
      }
      const ownerId = campaign.ownerId ?? (await this.businesses.findById(campaign.businessId)
        .select('ownerId').session(session).exec())?.ownerId;
      if (!ownerId) {
        throw new ConflictException({ code: 'CAMPAIGN_NOT_ACTIVE', message: 'This campaign is unavailable for investment.' });
      }

      await this.wallets.ensureWallet(investorId, session);
      const wallet = await this.wallets.debit(investorId, totalCost, investmentId, session);
      const [investment] = await this.investments.create([{
        ...identity, _id: investmentId, campaignId, units: dto.units,
        unitPriceAtPurchase: campaign.unitPrice, totalCost,
        receiptNumber: `FT-${now.getUTCFullYear()}-${investmentId.toHexString().toUpperCase()}`,
        campaignRemainingUnitsAfter: campaign.remainingUnits,
        pendingNotifications: { ownerId, campaignTitle: campaign.title, ownerNotificationId },
      }], { session });

      if (!campaign.firstInvestmentAt) {
        await this.campaigns.updateOne(
          { _id: campaignId, firstInvestmentAt: null },
          { $set: { firstInvestmentAt: now } },
          { session },
        ).exec();
      }
      if (campaign.remainingUnits === 0) await this.lifecycle.markFundedIfSoldOut(campaignId, session);
      await this.audit.record({
        actor: { role: UserRole.Investor, id: investorId },
        action: AuditAction.InvestmentCreated,
        entityType: 'investment',
        entityId: investmentId,
      }, session);
      return { replayed: false, receipt: this.receipt(investment, wallet.balance, campaign.remainingUnits) };
    });

    let result;
    try {
      try {
        result = await transact();
      } catch (error) {
        // A wallet read or purchase for another campaign can initialize this wallet first.
        if (!(error instanceof mongo.MongoServerError && error.code === 11000 && error.keyPattern?.userId === 1)) throw error;
        result = await transact();
      }
    } catch (error) {
      if (!(error instanceof mongo.MongoServerError && error.code === 11000 &&
          error.keyPattern?.investorId === 1 && error.keyPattern?.idempotencyKey === 1)) throw error;
      const winner = await this.investments.findOne(identity).exec();
      if (!winner) throw error;
      result = await this.replay(winner, campaignId, dto.units);
    }

    await this.delivery.deliver(result.receipt.investment._id);
    return result;
  }

  private async replay(
    investment: Investment & { _id: Types.ObjectId; createdAt: Date },
    campaignId: Types.ObjectId,
    units: number,
    session?: ClientSession,
  ) {
    if (!investment.campaignId.equals(campaignId) || investment.units !== units) {
      throw new ConflictException({
        code: 'IDEMPOTENCY_KEY_REUSED', message: 'This request key already belongs to a different purchase.',
      });
    }
    const debit = await this.transactions.findOne({
      investmentId: investment._id, userId: investment.investorId, type: TransactionType.InvestmentDebit,
    }).session(session ?? null).exec();
    const remaining = investment.campaignRemainingUnitsAfter ?? (await this.campaigns.findById(campaignId)
      .select('remainingUnits').session(session ?? null).exec())?.remainingUnits;
    if (!debit || remaining === undefined) {
      throw new ConflictException({ code: 'RECEIPT_UNAVAILABLE', message: 'The existing purchase receipt is incomplete.' });
    }
    return { replayed: true, receipt: this.receipt(investment, debit.balanceAfter, remaining) };
  }

  private receipt(
    investment: Investment & { _id: Types.ObjectId; createdAt: Date },
    walletBalance: number,
    campaignRemainingUnits: number,
  ) {
    const { _id, campaignId, units, unitPriceAtPurchase, totalCost, createdAt, status, receiptNumber } = investment;
    return {
      investment: { _id, campaignId, units, unitPriceAtPurchase, totalCost, createdAt, status },
      receiptNumber, walletBalance, campaignRemainingUnits,
    };
  }
}
