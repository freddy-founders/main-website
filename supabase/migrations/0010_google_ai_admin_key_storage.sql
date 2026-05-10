create table if not exists public.integration_secrets (
  provider text primary key,
  encrypted_secret text not null,
  secret_fingerprint text not null,
  model_id text not null default 'gemini-2.5-flash',
  configured_by_profile_id uuid references public.profiles(id) on delete set null,
  configured_at timestamptz not null default now(),
  last_validated_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint integration_secrets_provider_check check (provider in ('google_gemini_api_key'))
);

alter table public.integration_secrets enable row level security;
