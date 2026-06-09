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

## Database migrations (Supabase)

Schema lives in [supabase/migrations/](supabase/migrations/) — one timestamped SQL file per change.

### One-time setup

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Generate an access token at https://supabase.com/dashboard/account/tokens
3. Link the project locally:
   ```bash
   supabase login
   supabase link --project-ref llpbcorikvgizzbkadny
   ```

### Adding a migration

```bash
supabase migration new short_name
```

Edit the new file under `supabase/migrations/`, then apply:

```bash
supabase db push
```

### Auto-apply on push

The `Migrate Supabase` workflow runs on pushes to `main` that touch `supabase/migrations/**`. Add these repository secrets:

- `SUPABASE_ACCESS_TOKEN` — personal access token
- `SUPABASE_PROJECT_REF` — `llpbcorikvgizzbkadny`
- `SUPABASE_DB_PASSWORD` — DB password from Settings > Database
