import * as argon2 from 'argon2';
import { Connection, Types } from 'mongoose';
import { Business } from '../businesses/schemas/business.schema';
import { Campaign } from '../campaigns/schemas/campaign.schema';
import { BusinessSector, BusinessSize, BusinessType, CampaignStatus, UserRole, VerificationStatus } from '../common/enums';
import { User } from '../users/schemas/user.schema';

const accounts = [
  { key: 1, email: 'ft-demo-admin@example.test', name: 'Demo Administrator', role: UserRole.Admin },
  { key: 2, email: 'ft-demo-owner@example.test', name: 'Demo Business Owner', role: UserRole.BusinessOwner },
  { key: 3, email: 'ft-demo-investor-1@example.test', name: 'Demo Investor One', role: UserRole.Investor },
  { key: 4, email: 'ft-demo-investor-2@example.test', name: 'Demo Investor Two', role: UserRole.Investor },
];

function fixtureId(key: number): Types.ObjectId {
  return new Types.ObjectId(`f70d7000000000000000${key.toString(16).padStart(4, '0')}`);
}

function seedPassword(name: string): string {
  const password = process.env[name];
  if (!password || password.length < 12 || password.length > 128 || !password.trim()) {
    throw new Error(`Set ${name} to a password between 12 and 128 characters.`);
  }
  return password;
}

export async function seedDatabase(connection: Connection) {
  if (process.env.NODE_ENV === 'production') throw new Error('The demo seed requires a development or test database.');
  const adminPassword = seedPassword('SEED_ADMIN_PASSWORD');
  const demoPassword = seedPassword('SEED_DEMO_PASSWORD');
  if (adminPassword === demoPassword) throw new Error('Use different seed passwords for the admin and other demo accounts.');

  const users = connection.model<User>(User.name);
  const businesses = connection.model<Business>(Business.name);
  const campaigns = connection.model<Campaign>(Campaign.name);
  // Hash outside the transaction so repeated attempts can reuse the values.
  const [adminHash, ...demoHashes] = await Promise.all([
    argon2.hash(adminPassword, { type: argon2.argon2id }),
    ...accounts.slice(1).map(() => argon2.hash(demoPassword, { type: argon2.argon2id })),
  ]);
  const ownerId = fixtureId(2);
  const businessId = fixtureId(5);
  const businessSnapshot = {
    name: 'Demo Neighbourhood Grocery', sector: BusinessSector.GroceryRetail,
    division: 'Dhaka', district: 'Dhaka',
  };

  return connection.transaction(async session => {
    let created = 0;
    for (const account of accounts) {
      const _id = fixtureId(account.key);
      const existing = await users.findOne({ $or: [{ _id }, { email: account.email }] }).session(session);
      if (existing) {
        if (!existing._id.equals(_id) || existing.email !== account.email || existing.role !== account.role) {
          throw new Error('A demo account identity is already in use. No fixtures were changed.');
        }
        continue;
      }
      await users.create([{
        _id, email: account.email, displayName: account.name, phone: '01700000000',
        role: account.role, passwordHash: account.key === 1 ? adminHash : demoHashes[account.key - 2],
      }], { session });
      created += 1;
    }

    const now = new Date();
    const business = await businesses.findById(businessId).session(session);
    if (business && (!business.ownerId?.equals(ownerId) || business.deletedAt)) {
      throw new Error('The demo business identity is already in use. No fixtures were changed.');
    }
    if (!business) {
      await businesses.create([{
        _id: businessId, ownerId, officialName: businessSnapshot.name,
        businessType: BusinessType.SoleProprietorship, sector: businessSnapshot.sector,
        size: BusinessSize.Micro, establishedYear: 2020, employeeCount: 4,
        operatingHistory: 'Synthetic course fixture for the funding simulation.',
        division: businessSnapshot.division, district: businessSnapshot.district,
        address: 'Synthetic demo address', description: 'Synthetic grocery business for the FundTogether demo.',
        businessEmail: 'ft-demo-owner@example.test', contactPhone: '01700000000',
        verificationStatus: VerificationStatus.Approved, verifiedAt: now,
      }], { session });
      created += 1;
    }

    const durationDays = 30;
    const endsAt = new Date(now.getTime() + durationDays * 86_400_000);
    for (const [key, title] of [[6, 'Demo Grocery Refrigeration'], [7, 'Demo Grocery Inventory']] as const) {
      const _id = fixtureId(key);
      const existing = await campaigns.findById(_id).session(session);
      if (existing) {
        if (!existing.ownerId?.equals(ownerId) || !existing.businessId.equals(businessId) || existing.deletedAt) {
          throw new Error('A demo campaign identity is already in use. No fixtures were changed.');
        }
        continue;
      }
      if (business && business.verificationStatus !== VerificationStatus.Approved) {
        throw new Error('Approve the existing demo business before seeding a new active campaign.');
      }
      await campaigns.create([{
        _id, ownerId, businessId, businessSnapshot, title,
        description: 'Synthetic campaign for demonstrating virtual funding, with no real money or returns.',
        purpose: title, useOfFunds: 'Virtual course demonstration only.',
        unitPrice: 500, fundingTarget: 50_000, totalUnits: 100, remainingUnits: 100,
        status: CampaignStatus.Active, durationDays, startsAt: now, endsAt,
      }], { session });
      created += 1;
    }
    return created;
  });
}
