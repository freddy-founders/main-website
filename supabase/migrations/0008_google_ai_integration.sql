create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text not null default 'connected',
  connected_by_profile_id uuid references public.profiles(id) on delete set null,
  google_account_email text not null,
  google_cloud_project_id text not null,
  google_cloud_location text not null default 'global',
  model_id text not null default 'gemini-2.5-flash',
  encrypted_refresh_token text not null,
  scopes text[] not null default array[]::text[],
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz,
  last_validated_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint integration_connections_provider_check check (provider in ('google_vertex_ai')),
  constraint integration_connections_status_check check (status in ('connected', 'disconnected'))
);

create unique index if not exists integration_connections_one_active_google_ai
  on public.integration_connections(provider)
  where provider = 'google_vertex_ai' and status = 'connected';

create index if not exists integration_connections_provider_status_idx
  on public.integration_connections(provider, status);

alter table public.integration_connections enable row level security;

create table if not exists public.integration_oauth_states (
  state text primary key,
  provider text not null,
  actor_profile_id uuid references public.profiles(id) on delete cascade,
  google_cloud_project_id text not null,
  google_cloud_location text not null default 'global',
  model_id text not null default 'gemini-2.5-flash',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  constraint integration_oauth_states_provider_check check (provider in ('google_vertex_ai'))
);

create index if not exists integration_oauth_states_expires_at_idx
  on public.integration_oauth_states(expires_at);

alter table public.integration_oauth_states enable row level security;
