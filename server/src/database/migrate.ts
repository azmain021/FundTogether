import { Connection, mongo, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

const legacyIndexName = 'googleSub_1';

export async function verifyDatabaseIndexes(connection: Connection) {
  const missing: string[] = [];
  for (const model of Object.values(connection.models)) {
    const { toCreate } = await model.diffIndexes();
    for (const fields of toCreate) {
      missing.push(`${model.collection.name} (${Object.keys(fields).join(', ')})`);
    }
  }
  if (missing.length) throw new Error(`Missing or mismatched indexes: ${missing.join('; ')}. Run db:migrate.`);
}

export async function migrateDatabase(connection: Connection) {
  const userModel = connection.model<User>(User.name);
  const usersExist = (await connection.listCollections()).some(({ name }) => name === 'users');
  let hasLegacyIndex = false;
  let normalizedEmails = 0;

  if (usersExist) {
    const legacy = (await userModel.listIndexes()).find(index => index.name === legacyIndexName);
    if (legacy && (Object.keys(legacy.key).length !== 1 || legacy.key.googleSub !== 1 || !legacy.unique)) {
      throw new Error('The legacy users index has an unexpected definition. Review it before migrating.');
    }
    hasLegacyIndex = Boolean(legacy);

    normalizedEmails = await connection.transaction(async session => {
      const users = userModel.collection;
      const normalized = new Set<string>();
      const changes: { _id: Types.ObjectId; before: string; after: string }[] = [];

      for await (const { _id, email } of users.find({}, { projection: { email: 1 }, session })) {
        const canonical = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!canonical || normalized.has(canonical)) {
          throw new Error('Stored user emails are missing or collide after normalization. Resolve them before migration.');
        }
        normalized.add(canonical);
        if (email !== canonical) changes.push({ _id, before: email, after: canonical });
      }

      if (changes.length) {
        const result = await users.bulkWrite(changes.map(({ _id, before, after }) => ({
          updateOne: { filter: { _id, email: before }, update: { $set: { email: after } } },
        })), { session });
        if (result.matchedCount !== changes.length) throw new Error('User records changed during migration. Retry with the app stopped.');
      }
      return changes.length;
    });
  }

  for (const model of Object.values(connection.models)) {
    await model.createCollection();
    const { toCreate } = await model.diffIndexes({ indexOptionsToCreate: true });
    for (const [fields, options] of toCreate) {
      await model.collection.createIndex(fields, options);
    }
  }
  await verifyDatabaseIndexes(connection);

  // Keep every other index, including custom indexes, and preserve account data.
  if (hasLegacyIndex) {
    try {
      await userModel.collection.dropIndex(legacyIndexName);
    } catch (error) {
      if (!(error instanceof mongo.MongoServerError) || error.code !== 27) throw error;
    }
  }
  return { normalizedEmails, removedLegacyIndex: hasLegacyIndex };
}
