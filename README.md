# Kolin Relics

React + TypeScript + Vite app connected to Supabase, deployable on Vercel.

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

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel. The framework preset is detected as Vite.
3. Add environment variables in Vercel (Project Settings > Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy.
