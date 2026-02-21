# Hermes Waitlist

Standalone waitlist page for Hermes, built with Next.js and Supabase.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `../supabase/waitlist-migration.sql` in the Supabase SQL Editor
3. Add your Supabase credentials to `.env` (create it in the waitlist folder):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002).

## Project structure

- `app/` - Next.js app router pages and layout
- `components/` - Header, footer, waitlist form, UI primitives
- `lib/` - Supabase client, utils

## Tech stack

- Next.js 16, React 19
- Tailwind CSS v4
- Supabase
- next-themes (dark/light mode)
