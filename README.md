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
whose `verificationStatus` is `approved`; until the admin review flow exists, set
that field manually in Atlas for testing. **Pending:** authentication (so
`ownerId` and ownership checks are not enforced yet), document uploads, reviews
and approvals, and connecting the remaining prototype pages.

## MongoDB Atlas

Create a database user with read/write access to `fundtogether`, add your current
IP to the project's IP access list, and copy the URI from **Connect → Drivers**.
Paste it into `MONGODB_URI` in `server/.env`, replacing the username/password
placeholders and URL-encoding special characters. The backend selects the
`fundtogether` database. No local MongoDB service is required.

`server/.env` is Git-ignored; keep the URI out of frontend code.
See [MongoDB's connection guide](https://www.mongodb.com/docs/atlas/driver-connection/)
and [the project specification](docs/FundTogether%20Project%20Specification.md).
