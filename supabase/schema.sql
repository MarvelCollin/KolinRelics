create extension if not exists "pgcrypto";

create table if not exists public.relics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_buy numeric not null default 0,
  price_current numeric not null default 0,
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.relics enable row level security;

drop policy if exists "relics_select" on public.relics;
drop policy if exists "relics_insert" on public.relics;
drop policy if exists "relics_update" on public.relics;
drop policy if exists "relics_delete" on public.relics;

create policy "relics_select" on public.relics for select using (true);
create policy "relics_insert" on public.relics for insert with check (true);
create policy "relics_update" on public.relics for update using (true) with check (true);
create policy "relics_delete" on public.relics for delete using (true);

insert into storage.buckets (id, name, public)
values ('relic-images', 'relic-images', true)
on conflict (id) do nothing;

drop policy if exists "relic_images_select" on storage.objects;
drop policy if exists "relic_images_insert" on storage.objects;
drop policy if exists "relic_images_update" on storage.objects;
drop policy if exists "relic_images_delete" on storage.objects;

create policy "relic_images_select" on storage.objects for select using (bucket_id = 'relic-images');
create policy "relic_images_insert" on storage.objects for insert with check (bucket_id = 'relic-images');
create policy "relic_images_update" on storage.objects for update using (bucket_id = 'relic-images');
create policy "relic_images_delete" on storage.objects for delete using (bucket_id = 'relic-images');
