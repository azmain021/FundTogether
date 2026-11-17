# FundTogether API

NestJS REST backend organized into controllers, services and feature modules,
with Mongoose as the MongoDB persistence layer.

From the repository root:

```bash
pnpm install
cp server/.env.example server/.env
# Set MONGODB_URI in server/.env before starting.
pnpm dev
```

This starts both the React frontend and the API. The API listens on port 3000
unless `PORT` is set. MongoDB Atlas uses the `fundtogether` database.

Backend-only commands, from the repository root:

```bash
pnpm --filter server dev
pnpm --filter server build
pnpm --filter server test
pnpm --filter server test:e2e
```

See [the root README](../README.md) for setup and current feature status.
