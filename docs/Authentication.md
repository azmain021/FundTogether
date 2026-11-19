# Account and login flow

The current implementation uses email and password authentication. This replaces
the Google sign-in flow described in the original planning documents.

- `/register` offers Investor and Business Owner account types. Investor
  registration is not implemented yet and is marked as coming soon.
- `/business/register` creates a business owner account, then links to `/login`.
- `/login` validates credentials and sets an eight-hour HttpOnly session cookie.
- Business owners can then open `/business/profile` to set up their business.
- `/marketplace` remains available to visitors and currently uses demo content.
- `/campaigns/shobuj-bazar` requires login, including when opened directly.
  Other sample campaigns do not have detail pages yet.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/business-owner` | Create an owner account |
| POST | `/api/auth/login` | Check credentials and create a session |
| GET | `/api/auth/me` | Return the current account; 401 without a valid session |
| POST | `/api/auth/logout` | Delete the session and clear its cookie |

Passwords are hashed with Argon2id. Session tokens are random and only their
SHA-256 hashes are stored in the `sessions` collection. Sessions expire after
eight hours, and logout revokes them immediately. Expired records have a TTL
index; authentication checks the expiry directly rather than waiting for cleanup.
The session cookie uses `SameSite=Lax`, path `/api`, and `Secure` in production.
Browser authentication writes must come from `FRONTEND_ORIGIN`. During local
development, `http://localhost:5173` and `http://127.0.0.1:5173` are also accepted.

Campaign API routes require a valid session. Campaign-specific owner/role
authorization remains work for the campaign module. Business profiles and
documents now enforce owner authorization on the server. Profile setup loads
`GET /api/businesses/me`; it no longer uses a browser-stored business ID.

Registration does not automatically log in or create a business profile. Users
are stored in `fundtogether.users`, profiles in `fundtogether.businesses`, and
sessions in `fundtogether.sessions` in the MongoDB database configured by the API.

## Business registration and verification documents

1. Register an owner, then log in using the separate login page.
2. Complete `/business/profile`. The server assigns ownership from the session
   and allows one active business per owner. The first save opens Documents.
3. Upload trade licence, tax evidence, owner identity (both sides combined into
   one file), and bank account evidence. Address proof is optional, along with
   up to three additional supporting files.
4. Each file must be PDF, JPEG or PNG and at most 5 MB. The server checks the MIME
   type and file signature. Course demonstrations must use synthetic documents.
5. Uploads are saved immediately. The page can be refreshed, and a saved file can
   be downloaded, replaced or removed while the business is still editable.
6. The server recalculates eligibility from saved records before submission.
   Submission snapshots the profile and document IDs in `business_applications`
   and changes business verification to `pending` in a MongoDB transaction.
7. `/business/review-status` shows the stored application ID, round, submission
   time and document statuses. Refresh Status fetches the latest saved records.

File bytes are private files in `server/storage/` by default, configured with
`UPLOAD_DIR` in the server environment. This directory is not publicly served.
The `documents` collection in Atlas contains metadata and a private storage key;
API responses never expose storage keys or filesystem paths. Keep the storage
directory when restarting or deploying the backend so existing downloads remain
available. Replacement history is preserved, and old versions remain available
to the owner through authorized downloads.

Upload, replacement, deletion and submission use MongoDB transactions and
serialize through the business record. Use Atlas (or a MongoDB replica set), as
specified in the feature plan. Pending/approved applications are locked against
document changes and repeated submission. Rejected/correction-requested
applications can be updated and submitted as a new round.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/businesses/me` | Current owner's business or null |
| POST | `/api/businesses/:id/documents` | Multipart `type`, `file`, optional `replacesDocumentId` |
| GET | `/api/businesses/:id/documents` | Saved metadata and replacement history |
| GET | `/api/documents/:id/download` | Authorized attachment download |
| DELETE | `/api/documents/:id` | Remove a document from an editable application |
| GET | `/api/businesses/:id/eligibility` | Saved-data completion checklist |
| POST | `/api/businesses/:id/applications` | Submit a complete registration for review |
| GET | `/api/businesses/:id/applications/current` | Latest application, profile and document status |
| GET | `/api/businesses/:id/applications` | Submission history |

Administrative review/approval screens, notifications and audit integration
belong to the separate administrator workstream. Submission stores a real pending
application; it does not automatically approve the business or its documents.

## Existing database indexes

An existing database from the Google-only prototype may still have a unique
`googleSub_1` index and a non-unique `email_1` index. Removing a field from a
Mongoose schema does not migrate these existing database indexes.

The read-only diagnostic is `node test/inspect-registration-indexes.cjs` from
`server/`. The reviewed migration is `node test/migrate-registration-indexes.cjs`.
It checks for invalid/duplicate email groups, creates `unique_account_email`,
then removes only the obsolete `googleSub_1` index. It never changes account
records. Run the migration with the database owner's authorization.

The opt-in live test, `node test/onboarding.live-smoke.cjs`, creates labelled
synthetic records in the configured database and private file storage. It tests
registration, login, profile ownership, uploads, replacement, private downloads,
eligibility, submission and logout. Fixtures remain available for inspection
under their `reg-smoke-` prefix. Automated Jest tests use model doubles and do
not write fixtures to Atlas.

Old unowned prototype business profiles are not automatically assigned to a
new owner. This prevents one account from claiming another account's old data.
