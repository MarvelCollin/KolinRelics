alter table public.relics
  add column if not exists status text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'relics_status_check'
  ) then
    alter table public.relics
      add constraint relics_status_check check (status in ('new', 'sold'));
  end if;
end $$;
