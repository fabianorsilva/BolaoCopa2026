create table if not exists public.bolao_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.bolao_state enable row level security;

drop policy if exists "bolao_state_select" on public.bolao_state;
drop policy if exists "bolao_state_insert" on public.bolao_state;
drop policy if exists "bolao_state_update" on public.bolao_state;

create policy "bolao_state_select"
on public.bolao_state
for select
to anon
using (true);

create policy "bolao_state_insert"
on public.bolao_state
for insert
to anon
with check (true);

create policy "bolao_state_update"
on public.bolao_state
for update
to anon
using (true)
with check (true);
