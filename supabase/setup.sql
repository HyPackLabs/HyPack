-- HyPack Supabase setup
-- Run once in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Modpacks
create table if not exists public.modpacks (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text not null,
  description text not null default '',
  visibility text not null default 'Private'
    check (visibility in ('Private', 'Unlisted', 'Public')),
  icon_url text,
  -- Stored required-mod tags (requiredBy, directRequiredDeps, userAddedModIds)
  dependency_state jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modpack_mods (
  id uuid primary key default gen_random_uuid(),
  modpack_id uuid not null references public.modpacks (id) on delete cascade,
  curseforge_mod_id integer not null,
  curseforge_file_id integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (modpack_id, curseforge_mod_id)
);

create index if not exists modpacks_clerk_user_id_idx on public.modpacks (clerk_user_id);
create index if not exists modpack_mods_modpack_id_idx on public.modpack_mods (modpack_id);

-- Backfill for databases created before dependency_state existed
alter table public.modpacks add column if not exists dependency_state jsonb;

-- Modpack likes (one per user per modpack)
create table if not exists public.modpack_likes (
  id uuid primary key default gen_random_uuid(),
  modpack_id uuid not null references public.modpacks (id) on delete cascade,
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  unique (modpack_id, clerk_user_id)
);

create index if not exists modpack_likes_modpack_id_idx on public.modpack_likes (modpack_id);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists modpacks_set_updated_at on public.modpacks;
create trigger modpacks_set_updated_at
before update on public.modpacks
for each row execute function public.set_updated_at();

-- Row level security
alter table public.modpacks enable row level security;
alter table public.modpack_mods enable row level security;
alter table public.modpack_likes enable row level security;

-- RLS: works when Clerk JWT is passed to Supabase (Clerk Supabase integration).
-- Server-side code also filters by clerk_user_id as a safeguard.
create policy "modpacks_select_own"
  on public.modpacks for select
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "modpacks_insert_own"
  on public.modpacks for insert
  with check (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "modpacks_update_own"
  on public.modpacks for update
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "modpacks_delete_own"
  on public.modpacks for delete
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "modpack_mods_select_own"
  on public.modpack_mods for select
  using (
    exists (
      select 1 from public.modpacks m
      where m.id = modpack_id and m.clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "modpack_mods_insert_own"
  on public.modpack_mods for insert
  with check (
    exists (
      select 1 from public.modpacks m
      where m.id = modpack_id and m.clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "modpack_mods_update_own"
  on public.modpack_mods for update
  using (
    exists (
      select 1 from public.modpacks m
      where m.id = modpack_id and m.clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "modpack_mods_delete_own"
  on public.modpack_mods for delete
  using (
    exists (
      select 1 from public.modpacks m
      where m.id = modpack_id and m.clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

create policy "modpack_likes_select_all"
  on public.modpack_likes for select
  using (true);

create policy "modpack_likes_insert_own"
  on public.modpack_likes for insert
  with check (clerk_user_id = (auth.jwt() ->> 'sub'));

create policy "modpack_likes_delete_own"
  on public.modpack_likes for delete
  using (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Modpack icon storage
insert into storage.buckets (id, name, public)
values ('modpack-icons', 'modpack-icons', true)
on conflict (id) do update set public = true;

create policy "modpack_icons_public_read"
  on storage.objects for select
  using (bucket_id = 'modpack-icons');
