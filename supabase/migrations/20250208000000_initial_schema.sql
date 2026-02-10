-- OpenClaw/Moltbot (Clawdbot) agent platform – initial schema for Supabase
-- Run in Supabase Dashboard → SQL Editor (paste and Run), or: supabase db push

-- Channel type enum (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'channel_type') then
    create type public.channel_type as enum ('telegram');
  end if;
end
$$;

-- Users (app-managed; NextAuth, not Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists users_email_idx on public.users (email);

-- Agents (one per user, linked to gateway)
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  gateway_agent_id text not null,
  gateway_workspace_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agents_user_id_idx on public.agents (user_id);

-- Agent bindings (e.g. Telegram user linked to an agent)
create table if not exists public.agent_bindings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  channel_type public.channel_type not null default 'telegram',
  channel_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, channel_type, channel_user_id)
);
create index if not exists agent_bindings_user_id_idx on public.agent_bindings (user_id);
create index if not exists agent_bindings_agent_id_idx on public.agent_bindings (agent_id);

-- Claim tokens for Telegram linking (short-lived)
create table if not exists public.agent_binding_claims (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agent_binding_claims_agent_id_idx on public.agent_binding_claims (agent_id);
create index if not exists agent_binding_claims_expires_at_idx on public.agent_binding_claims (expires_at);

-- RLS enabled (service_role bypasses; add policies if you use anon key from client)
alter table public.users enable row level security;
alter table public.agents enable row level security;
alter table public.agent_bindings enable row level security;
alter table public.agent_binding_claims enable row level security;
