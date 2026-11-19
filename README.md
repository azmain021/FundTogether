# FundTogether

CSE470 educational business-funding simulation. All balances and investments are virtual.

## Local development

Use Node.js 22.12+ and pnpm 11.18.0. Run commands from the repository root:

```bash
pnpm install
cp server/.env.example server/.env
```

Set `MONGODB_URI` in `server/.env` to your MongoDB Atlas connection string, then:

```bash
pnpm dev
```

This starts React/Vite at **http://localhost:5173** and the NestJS API at
**http://localhost:3000** (or the `PORT` in `server/.env`). Ctrl+C stops both.
Restart after changing `.env`. Dependencies use one root `pnpm-lock.yaml`;
separate installs in `client/` and `server/` are unnecessary.

Other root commands:

```bash
pnpm build
pnpm lint
pnpm test
```

## Architecture (MVC)

The application is a separate React frontend and NestJS REST backend, organized
around MVC principles (not server-rendered templates). Each backend feature
module in `server/src/<feature>/` follows the same layout:

| Layer | Location | Role |
|---|---|---|
| **Model** | `schemas/<name>.schema.ts` | Mongoose schema: fields, types, defaults, indexes |
| **Controller** | `<feature>.controller.ts` | HTTP routes under `/api`; delegates to the service |
| Service | `<feature>.service.ts` | Business rules and database reads/writes |
| DTO | `dto/*.dto.ts` | Request validation (`class-validator`); unknown fields are rejected |
| **View** | `client/src/*.tsx` | React pages; call the API through `client/src/api/` |

Shared enums live in `server/src/common/enums.ts` and are mirrored for the client
in `client/src/api/types.ts`. In development, Vite proxies `/api` to the NestJS
server, so the client needs no extra configuration.

**Implemented so far:** Business profile CRUD (`/api/businesses`) and campaign
draft CRUD (`/api/campaigns`) persist to MongoDB, and the business profile page
saves to and reloads from the API. A campaign can only be created for a business
whose `verificationStatus` is `approved`. The demo seed provisions an approved
example business while the admin review flow is pending. Business owners and
investors can register, and all three roles can log in and reset their
passwords. The owner document upload flow is wired. Owners can submit campaign
drafts, administrators can approve or reject them, and published campaigns appear
on the marketplace. The full business verification review flow is pending.
See [Authentication](docs/Authentication.md) for sign-in and instant password
recovery using a saved code.

## MongoDB Atlas

Create a database user with read/write access to `fundtogether`, add your current
IP to the project's IP access list, and copy the URI from **Connect → Drivers**.
Paste it into `MONGODB_URI` in `server/.env`, replacing the username/password
placeholders and URL-encoding special characters. The backend uses
`MONGODB_DATABASE` when set and falls back to `fundtogether`. A local MongoDB
replica set can be used for development and tests.

`server/.env` is Git-ignored; keep the URI out of frontend code.
See [MongoDB's connection guide](https://www.mongodb.com/docs/atlas/driver-connection/)
and [the project specification](docs/FundTogether%20Project%20Specification.md).

### Database migration, demo seed, and verification

Set `MONGODB_URI` and `MONGODB_DATABASE` explicitly in `server/.env` or the
shell. Use a separate database on a replica set for tests. Stop the API while
migrating an existing development database.

```bash
pnpm --filter server db:migrate
pnpm --filter server db:verify
pnpm --filter server seed
```

- `db:migrate` creates collections and missing indexes. It rejects blank or
  conflicting stored emails before normalizing them and removes the obsolete
  Google-only index after email uniqueness is in place. It preserves account
  IDs, roles, passwords, and unrelated indexes. Legacy Google-only accounts
  still need a local password before they can sign in.
- `db:verify` compares live indexes with the application models and checks a
  wallet uniqueness violation and a multi-collection rollback. The probe
  records are rolled back.
- `seed` requires distinct `SEED_ADMIN_PASSWORD` and `SEED_DEMO_PASSWORD`
  values. It creates synthetic admin, owner, and investor accounts, one
  approved business, and two active campaigns. Reruns preserve existing
  fixture passwords, campaign dates, and record counts.

| Demo login | Password variable |
|---|---|
| `ft-demo-admin@example.test` | `SEED_ADMIN_PASSWORD` |
| `ft-demo-owner@example.test` | `SEED_DEMO_PASSWORD` |
| `ft-demo-investor-1@example.test` | `SEED_DEMO_PASSWORD` |
| `ft-demo-investor-2@example.test` | `SEED_DEMO_PASSWORD` |
