# Kolin Relics

React + TypeScript + Vite app connected to Supabase, deployed on GitHub Pages.

## Setup

```bash
npm install
```

Create a `.env` file (copy from `.env.example`) and fill in your Supabase values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

Find these in your Supabase dashboard under Project Settings > API. Use the publishable (anon) key only. Never put the secret key in this frontend.

## Develop

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push to the `main` branch on GitHub.
2. In the repo, open Settings > Pages and set Source to **GitHub Actions**.
3. Add these repository secrets (Settings > Secrets and variables > Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. The `Deploy to GitHub Pages` workflow runs on push to `main` and publishes to `https://marvelcollin.github.io/KolinRelics/`.

## Admin user

The admin panel uses Supabase Auth. RLS allows `anon` to read but only `authenticated` users can write.

The login form accepts a **username** (e.g. `admin`); the frontend appends `@kolinrelics.local` before authenticating, so the underlying Supabase user must be `admin@kolinrelics.local`.

Create the user once in Supabase Dashboard → Authentication → Users → Add user:

- **Email:** `admin@kolinrelics.local`
- **Password:** anything strong
- ✅ Tick **"Auto Confirm User"**

Then log in at `/admin` with username `admin` and that password.

## Database migrations

Each schema change is a timestamped SQL file in [supabase/migrations/](supabase/migrations/). The bundled migration script connects via the connection pooler using credentials from `.env`.

Apply all pending migrations:

```bash
npm run migrate
```

The script tracks applied migrations in a `_migrations` table and skips files already applied.

Required `.env` entries:

```
SUPABASE_DB_PASSWORD=...
SUPABASE_PROJECT_REF=...
SUPABASE_DB_REGION=aws-1-ap-southeast-1
```

To create a new migration, add a file under `supabase/migrations/` with a timestamp prefix newer than the previous one (e.g. `20260615120000_add_field.sql`).
