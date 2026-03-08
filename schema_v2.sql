-- ════════════════════════════════════════════════════════════════
-- InternTrack — User Profiles Schema (schema_v2.sql)
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- 1. Create a public profiles table that you can view in the Table Editor
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  email       text not null,
  join_date   timestamptz default now()
);

-- 2. Turn on Row Level Security
alter table public.profiles enable row level security;

-- 3. Policy: Users can only see and update their own profile
create policy "Users can view own profile" 
on public.profiles for select using ( auth.uid() = id );
create policy "Users can update own profile" 
on public.profiles for update using ( auth.uid() = id );

-- 4. Create a trigger function that runs *automatically* when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name' -- extracts name passed during signup
  );
  return new;
end;
$$;

-- 5. Attach the trigger to the hidden auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: Link it visually in the dashboard so you can query them together easily
comment on table public.profiles is 'Public user data synced from auth.users';
