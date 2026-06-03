create extension if not exists pgcrypto;

create table if not exists public.bolao_participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  access_code text unique,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.bolao_guesses (
  participant_id uuid not null references public.bolao_participants(id) on delete cascade,
  match_id text not null,
  home_score integer not null check (home_score >= 0 and home_score <= 20),
  away_score integer not null check (away_score >= 0 and away_score <= 20),
  updated_at timestamptz not null default now(),
  primary key (participant_id, match_id)
);

create table if not exists public.bolao_results (
  match_id text primary key,
  home_score integer not null check (home_score >= 0 and home_score <= 20),
  away_score integer not null check (away_score >= 0 and away_score <= 20),
  updated_at timestamptz not null default now()
);

alter table public.bolao_participants enable row level security;
alter table public.bolao_guesses enable row level security;
alter table public.bolao_results enable row level security;

grant select, insert, update, delete on public.bolao_participants to anon, authenticated;
grant select, insert, update, delete on public.bolao_guesses to anon, authenticated;
grant select, insert, update, delete on public.bolao_results to anon, authenticated;

drop policy if exists "participants_select" on public.bolao_participants;
drop policy if exists "participants_insert" on public.bolao_participants;
drop policy if exists "participants_update" on public.bolao_participants;
drop policy if exists "participants_delete" on public.bolao_participants;
drop policy if exists "guesses_select" on public.bolao_guesses;
drop policy if exists "guesses_insert" on public.bolao_guesses;
drop policy if exists "guesses_update" on public.bolao_guesses;
drop policy if exists "results_select" on public.bolao_results;
drop policy if exists "results_insert" on public.bolao_results;
drop policy if exists "results_update" on public.bolao_results;
drop policy if exists "results_delete" on public.bolao_results;

create policy "participants_select"
on public.bolao_participants
for select
to anon
using (true);

create policy "participants_insert"
on public.bolao_participants
for insert
to anon
with check (true);

create policy "participants_update"
on public.bolao_participants
for update
to anon
using (true)
with check (true);

create policy "participants_delete"
on public.bolao_participants
for delete
to anon
using (true);

create policy "guesses_select"
on public.bolao_guesses
for select
to anon
using (true);

create policy "guesses_insert"
on public.bolao_guesses
for insert
to anon
with check (true);

create policy "guesses_update"
on public.bolao_guesses
for update
to anon
using (true)
with check (true);

create policy "results_select"
on public.bolao_results
for select
to anon
using (true);

create policy "results_insert"
on public.bolao_results
for insert
to anon
with check (true);

create policy "results_update"
on public.bolao_results
for update
to anon
using (true)
with check (true);

create policy "results_delete"
on public.bolao_results
for delete
to anon
using (true);
