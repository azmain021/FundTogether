// One-time migration from Google-only accounts to email/password accounts.
// Changes indexes only: never updates or deletes account records.
const { ConfigModule } = require('@nestjs/config');
const mongoose = require('mongoose');

async function main() {
  await ConfigModule.forRoot();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fundtogether' });
  try {
    const users = mongoose.connection.collection('users');
    const invalidGroups = await users.aggregate([
      { $group: { _id: { $toLower: { $trim: { input: { $ifNull: ['$email', ''] } } } }, count: { $sum: 1 } } },
      { $match: { $or: [{ _id: '' }, { count: { $gt: 1 } }] } },
      { $count: 'count' },
    ]).toArray();
    if (invalidGroups.length) throw new Error('Stored emails need review before adding uniqueness. No indexes changed.');
    const indexes = await users.indexes();
    const legacy = indexes.find(index => index.name === 'googleSub_1');
    if (legacy && (Object.keys(legacy.key).length !== 1 || legacy.key.googleSub !== 1 || !legacy.unique)) {
      throw new Error('The legacy index definition is unexpected. No indexes changed.');
    }
    // Build email uniqueness before removing the obsolete Google-only rule.
    await users.createIndex({ email: 1 }, { name: 'unique_account_email', unique: true });
    console.log('Verified unique email index: unique_account_email');
    if (legacy) {
      await users.dropIndex('googleSub_1');
      console.log('Removed obsolete Google-only index: googleSub_1');
    }
    console.log('Migration complete. No account records were changed or deleted.');
  } finally { await mongoose.disconnect(); }
}

main().catch(error => { console.error(error.code ? `${error.name} (code ${error.code})` : error.message); process.exitCode = 1; });
