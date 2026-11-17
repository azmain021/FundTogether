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

## Architecture

- **React views:** pages and browser interactions in `client/src/`.
- **NestJS controllers:** HTTP endpoints in each backend feature module.
- **Services:** application logic and database operations behind controllers.
- **Mongoose models:** the persistence layer for MongoDB; define schemas within
  their feature modules as database-backed features are implemented.

The application uses a separate React frontend and NestJS REST backend, organized
around MVC principles. It does not use server-rendered Handlebars templates.
Business CRUD currently returns scaffold responses; persistent schemas, campaign
CRUD, authentication, uploads and approvals remain pending. The React prototype
currently uses local/illustrative data and is not connected to the API.

## MongoDB Atlas

Create a database user with read/write access to `fundtogether`, add your current
IP to the project's IP access list, and copy the URI from **Connect → Drivers**.
Paste it into `MONGODB_URI` in `server/.env`, replacing the username/password
placeholders and URL-encoding special characters. The backend selects the
`fundtogether` database. No local MongoDB service is required.

`server/.env` is Git-ignored; keep the URI out of frontend code.
See [MongoDB's connection guide](https://www.mongodb.com/docs/atlas/driver-connection/)
and [the project specification](docs/FundTogether%20Project%20Specification.md).
