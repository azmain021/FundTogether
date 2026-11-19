import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createConnection, mongo, Schema } from 'mongoose';
import { databaseModels } from './model-definitions';
import { migrateDatabase, verifyDatabaseIndexes } from './migrate';
import { seedDatabase } from './seed';
import { verifyDatabase } from './verify';

async function main() {
  const command = process.argv[2];
  if (command !== 'migrate' && command !== 'seed' && command !== 'verify') {
    throw new Error('Choose migrate, seed, or verify.');
  }
  if (existsSync('.env')) loadEnvFile();
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DATABASE?.trim();
  if (!uri || !dbName) throw new Error('Set MONGODB_URI and explicitly name the target in MONGODB_DATABASE.');
  if (command === 'seed' && process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed requires a development or test database.');
  }

  const connection = createConnection(uri, {
    dbName, autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 10_000,
  });
  try {
    await connection.asPromise();
    const topology = await connection.db!.admin().command({ hello: 1 });
    if (!topology.setName && topology.msg !== 'isdbgrid') {
      throw new Error('Use a MongoDB replica set or Atlas for transaction support.');
    }
    for (const { name, schema } of databaseModels) {
      connection.model(name, schema as Schema);
    }

    if (command === 'migrate') {
      const result = await migrateDatabase(connection);
      console.log(`Verified indexes for ${databaseModels.length} collections in ${dbName}.`);
      console.log(`Normalized ${result.normalizedEmails} user email(s). Removed legacy index: ${result.removedLegacyIndex}.`);
    } else if (command === 'seed') {
      await verifyDatabaseIndexes(connection);
      const created = await seedDatabase(connection);
      console.log(`Created ${created} demo records in ${dbName}. Existing fixtures were preserved.`);
    } else {
      await verifyDatabase(connection);
      console.log(`Verified ${databaseModels.length} collections, wallet uniqueness, and transaction rollback in ${dbName}.`);
    }
  } finally {
    await connection.close();
  }
}

main().catch(error => {
  if (error instanceof mongo.MongoError) {
    console.error(`MongoDB operation failed (${error.name}${error.code ? `, code ${error.code}` : ''}). Check the connection and target database.`);
  } else {
    console.error(error instanceof Error ? error.message : 'Database command failed.');
  }
  process.exitCode = 1;
});
