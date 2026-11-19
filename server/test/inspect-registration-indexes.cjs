// Read-only diagnostic. Prints index definitions, never account records or the URI.
const { ConfigModule } = require('@nestjs/config');
const mongoose = require('mongoose');

async function main() {
  await ConfigModule.forRoot();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fundtogether' });
  try {
    const indexes = await mongoose.connection.collection('users').indexes();
    console.log(JSON.stringify(indexes.map(({ name, key, unique, sparse }) => ({ name, key, unique, sparse })), null, 2));
  } finally { await mongoose.disconnect(); }
}

main().catch(error => { console.error(error.name, error.code ?? ''); process.exitCode = 1; });
