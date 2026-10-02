# SoftPro CS Field Playbook

## Local Setup
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in the required variables.

## Database Setup
1. Ensure PostgreSQL is installed and running.
2. In your `.env` file, set `DATABASE_URL` to your connection string. Example: `DATABASE_URL="postgresql://user:password@localhost:5432/softpro?schema=public"`

## Authentication Configuration
1. Authentication is modularly implemented using Auth.js (NextAuth).
2. Set `AUTH_SECRET` in `.env` to a secure random string (e.g., generated via `openssl rand -base64 32`).
3. For Phase 2 preview, a dummy Credentials provider is configured in `src/lib/auth.ts`. This will be replaced with the client's chosen provider (e.g., Google OAuth) in Phase 3.

## Migration Steps
1. Once the database is configured, run `npx prisma db push` (for prototyping) or `npx prisma migrate dev` (for structured migrations) to build the schema.

## Seed Steps
1. Run `npm run prisma db seed` to safely populate the database with the Phase 1 legacy JSON data (Categories, Playbooks, Authority Rules, Policies, Tools). This process is idempotent.

## Development Command
Run the local dev server:
`npm run dev`

## Lint Command
`npm run lint`

## Build Command
`npm run build`

## Creating the First ADMIN User
Because the system strictly authorizes users via the database, you cannot simply sign in with a new account and gain access.
1. Sign in via your chosen Auth provider to create a base User record.
2. Connect directly to your PostgreSQL database (e.g., via `psql` or Prisma Studio).
3. Update your User record's role: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';`
4. Once you have ADMIN access, you can manage and elevate other users from `/admin/users` directly in the UI.
