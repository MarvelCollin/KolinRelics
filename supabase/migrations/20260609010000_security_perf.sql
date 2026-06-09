drop policy if exists "relics_select" on public.relics;
drop policy if exists "relics_insert" on public.relics;
drop policy if exists "relics_update" on public.relics;
drop policy if exists "relics_delete" on public.relics;

create policy "relics_public_select"
  on public.relics for select
  to anon, authenticated
  using (true);

create policy "relics_auth_insert"
  on public.relics for insert
  to authenticated
  with check (true);

create policy "relics_auth_update"
  on public.relics for update
  to authenticated
  using (true) with check (true);

create policy "relics_auth_delete"
  on public.relics for delete
  to authenticated
  using (true);

drop policy if exists "relic_images_select" on storage.objects;
drop policy if exists "relic_images_insert" on storage.objects;
drop policy if exists "relic_images_update" on storage.objects;
drop policy if exists "relic_images_delete" on storage.objects;

create policy "relic_images_public_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'relic-images');

create policy "relic_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'relic-images');

create policy "relic_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'relic-images')
  with check (bucket_id = 'relic-images');

create policy "relic_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'relic-images');

create index if not exists relics_created_at_idx
  on public.relics (created_at desc);

create index if not exists relics_status_idx
  on public.relics (status);
