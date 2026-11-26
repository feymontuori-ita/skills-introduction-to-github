-- TODAY. — Phase 1 schema
-- Every table is owned by one user (auth.uid()) and protected by Row Level Security.
-- Counters (promises kept, loops interrupted, days showed up) are computed, never stored.

-- ─────────────────────────────────────────────────────────────
-- 0. Single-user lock: only the email in private.allowed_email may sign up.
--    Fails closed: if no email is configured, nobody can sign up.
-- ─────────────────────────────────────────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.allowed_email (
  email text primary key
);

create or replace function private.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.allowed_email a
    where lower(a.email) = lower(new.email)
  ) then
    raise exception 'Sign-ups are closed.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_allowed_email on auth.users;
create trigger enforce_allowed_email
  before insert on auth.users
  for each row execute function private.enforce_allowed_email();

-- ─────────────────────────────────────────────────────────────
-- 1. profile
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  timezone text not null default 'America/New_York',
  trusted_contact_name text,
  trusted_contact_phone text,
  manifesto text,
  keep_audio boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  last_morning_page_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create the profile row automatically when the (single) user signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. loops (known thought loops, editable in-app)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.loops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null,                 -- stable slug, e.g. 'relationship_insecurity'
  label text not null,
  trigger text,
  thought text,
  reframe text,
  editable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

-- ─────────────────────────────────────────────────────────────
-- 3. sessions (one Reset run)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  transcript text not null,
  input_mode text not null default 'text' check (input_mode in ('voice', 'text')),
  ai_output jsonb,
  loop_key text,
  safety_flag boolean not null default false,
  used_fallback boolean not null default false,
  audio_path text,                   -- only set if "keep audio" is on
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_created_idx on public.sessions (user_id, created_at desc);
create index if not exists sessions_user_loop_idx on public.sessions (user_id, loop_key, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 4. reframes (library)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reframes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  loop_key text,
  trigger_thought text,
  text text not null,                -- the reframe
  principle text,
  next_move text,
  next_move_minutes int,
  source text not null default 'session' check (source in ('seed', 'session')),
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reframes_user_created_idx on public.reframes (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 5. commitments
-- ─────────────────────────────────────────────────────────────
create table if not exists public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  source text not null default 'reset' check (source in ('reset', 'quick_reset', 'manual')),
  action text not null,
  minimum_version text,
  due_at timestamptz not null,
  status text not null default 'open'
    check (status in ('open', 'started', 'done', 'missed', 'dropped')),
  completed_at timestamptz,
  miss_reason text check (miss_reason in ('tired', 'hungry', 'too_big', 'forgot', 'changed_mind')),
  parent_id uuid references public.commitments (id) on delete set null, -- "make it smaller" chain
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists commitments_user_status_idx on public.commitments (user_id, status, due_at);
create index if not exists commitments_due_idx on public.commitments (due_at) where status = 'open' and notified_at is null;

-- ─────────────────────────────────────────────────────────────
-- 6. push_subscriptions
-- ─────────────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 7. Row Level Security: on for every table, owner-only.
-- ─────────────────────────────────────────────────────────────
alter table public.profile            enable row level security;
alter table public.loops              enable row level security;
alter table public.sessions           enable row level security;
alter table public.reframes           enable row level security;
alter table public.commitments        enable row level security;
alter table public.push_subscriptions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profile','loops','sessions','reframes','commitments','push_subscriptions']
  loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);
    execute format('create policy "owner_select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "owner_insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "owner_update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "owner_delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- updated_at bookkeeping
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists touch_profile on public.profile;
create trigger touch_profile before update on public.profile
  for each row execute function private.touch_updated_at();
drop trigger if exists touch_loops on public.loops;
create trigger touch_loops before update on public.loops
  for each row execute function private.touch_updated_at();
drop trigger if exists touch_commitments on public.commitments;
create trigger touch_commitments before update on public.commitments
  for each row execute function private.touch_updated_at();
