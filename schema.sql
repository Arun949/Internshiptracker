-- ════════════════════════════════════════════════════════════════
-- InternTrack — Supabase Schema
-- Run this once in: supabase.com → your project → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════

-- 1. Create the internship_cards table
create table if not exists internship_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  company     text not null,
  role        text not null,
  location    text,
  deadline    date,
  salary      text,
  notes       text,
  status      text not null default 'saved'
               check (status in ('saved','applied','interview','offer','rejected')),
  logo        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Enable Row Level Security (users only see their own data)
alter table internship_cards enable row level security;

-- 3. Policy: users can SELECT, INSERT, UPDATE, DELETE only their own rows
create policy "Users manage own cards"
  on internship_cards
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Auto-update updated_at on every UPDATE
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger internship_cards_updated_at
  before update on internship_cards
  for each row execute function update_updated_at();

-- 5. Enable real-time for this table
-- (Also toggle it in: supabase.com → Database → Replication → internship_cards)
alter publication supabase_realtime add table internship_cards;
