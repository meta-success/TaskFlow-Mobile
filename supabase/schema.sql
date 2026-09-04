-- Aura AI — Supabase schema
-- Run this in the SQL editor of your Supabase project.

create extension if not exists "pgcrypto";

create table if not exists public.chats (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  model text,
  provider text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists chats_user_updated_idx
  on public.chats (user_id, updated_at desc);

create index if not exists documents_user_idx
  on public.documents (user_id, created_at desc);

alter table public.chats enable row level security;
alter table public.documents enable row level security;

create policy "Users manage their chats"
  on public.chats
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their documents"
  on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
