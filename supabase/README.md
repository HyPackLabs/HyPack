# Supabase setup for HyPack

## 1. Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier is fine)

## 2. Run the setup script

1. Open **SQL Editor** in your Supabase project
2. Paste and run `setup.sql`

## 3. Add environment variables

Copy `.env.example` to `.env` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service_role key (server only, never expose to the browser)

## 4. Optional: Clerk + Supabase JWT (for RLS)

HyPack uses the service role on the server with Clerk `userId` filtering. To enable Row Level Security via Clerk JWTs later, follow [Clerk's Supabase integration](https://clerk.com/docs/integrations/databases/supabase).

## 5. Modpack icons

`setup.sql` creates an `icon_url` column on `modpacks` and a public `modpack-icons` storage bucket. Icons are uploaded from the create and settings screens (JPEG or PNG, max 2 MB).
