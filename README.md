# FlatSplit

A mobile-first four-person flat expense manager built with Next.js App Router, Tailwind CSS, Supabase and Vercel.

## Features

- Four fixed roommate profiles.
- Quick Add drawer.
- Equal or selective splits.
- Monthly expense dashboard.
- Category filtering.
- Net balance calculation.
- Greedy debt simplification into a small number of transfers.
- One-click settlement recording.
- CSV and PDF export.
- Supabase RLS and Realtime-ready schema.

## Local setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase URL and anon key.
5. Install dependencies:

```bash
npm install
```

6. Start:

```bash
npm run dev
```

## Vercel

Create a new Vercel project from the Git repository. Add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the same values for Production, Preview and Development where appropriate.

## Important production note

The supplied RLS policies assume the app is deployed behind Supabase Auth and that only trusted authenticated flat members can access the single flat. For a public multi-flat SaaS, add `flats` and `flat_members` tables and scope every row by `flat_id`.

The dashboard currently loads the current month on the server. For a full multi-period UI, pass selected `from`/`to` values to a Server Action or route handler and revalidate after mutations.

## Realtime

The SQL enables Supabase Realtime for expenses, splits and settlements. A production UI can subscribe with `supabase.channel(...).on('postgres_changes', ...)` and refresh its server data when a row changes.
