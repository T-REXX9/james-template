# Supabase-backed CRM dashboard

This project uses Supabase for authentication and data storage (contacts, products, pipeline deals, agents, and call logs).

## Prerequisites
- Node.js 18+
- Supabase project

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase project values. The provided sample URL/key in `.env.example` match the supplied project, but you should replace them when deploying your own instance. Never expose the service role key to the browser.
3. Apply the database schema in Supabase:
   - Open `supabase_schema.sql` in the Supabase SQL editor or run it with the Supabase CLI.
4. Seed legacy mock data into Supabase (server side only):
   - Set server environment variables (these must **not** be exposed to the client):
     ```bash
     export SUPABASE_URL=<your-supabase-url>
     export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     ```
   - Run the migration script using a TS runner such as [`tsx`](https://github.com/esbuild-kit/tsx) or `ts-node`:
     ```bash
     npx tsx scripts/seedSupabase.ts
     ```
     The script upserts contacts, products, deals, agents, and call logs to avoid duplicates on repeated runs.

## Development
Start the Vite dev server:
```bash
npm run dev
```

## Supabase configuration notes
- The client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`.
- Data fetching no longer falls back to local mocks; make sure your Supabase tables contain data (use the seeding script above).
- Service-role keys are required **only** for running the seeding script and must be kept on the server side.
