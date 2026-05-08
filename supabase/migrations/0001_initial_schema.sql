create extension if not exists pgcrypto;

create type public.publication_status as enum (
  'draft',
  'pending_review',
  'published',
  'archived'
);

create type public.public_visibility as enum (
  'public',
  'members',
  'private'
);

create type public.account_role as enum (
  'visitor',
  'member',
  'organizer',
  'admin'
);

create type public.registration_request_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type public.event_registration_mode as enum (
  'external',
  'disabled',
  'internal'
);

create type public.event_capacity_status as enum (
  'open',
  'limited',
  'full',
  'waitlist',
  'unknown'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role public.account_role not null default 'member',
  public_directory_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  category text,
  stage text,
  location_label text,
  website_url text,
  publication_status public.publication_status not null default 'draft',
  visibility public.public_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_slug_not_blank check (length(trim(slug)) > 0),
  constraint companies_name_not_blank check (length(trim(name)) > 0)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  slug text not null unique,
  name text not null,
  role text,
  company_name text,
  location_label text,
  founder_context text,
  topics text[] not null default '{}',
  public_directory_consent boolean not null default false,
  publication_status public.publication_status not null default 'draft',
  visibility public.public_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_slug_not_blank check (length(trim(slug)) > 0),
  constraint people_name_not_blank check (length(trim(name)) > 0)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_label text,
  summary text,
  registration_mode public.event_registration_mode not null default 'disabled',
  registration_url text,
  registration_label text,
  capacity_status public.event_capacity_status not null default 'unknown',
  publication_status public.publication_status not null default 'draft',
  visibility public.public_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_slug_not_blank check (length(trim(slug)) > 0),
  constraint events_title_not_blank check (length(trim(title)) > 0),
  constraint events_external_registration_has_url check (
    registration_mode <> 'external'
    or registration_url is not null
  )
);

create table public.event_person_links (
  event_id uuid not null references public.events (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  relationship_label text,
  created_at timestamptz not null default now(),
  primary key (event_id, person_id)
);

create table public.event_company_links (
  event_id uuid not null references public.events (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  relationship_label text,
  created_at timestamptz not null default now(),
  primary key (event_id, company_id)
);

create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  role text,
  founder_context text,
  topics text[] not null default '{}',
  public_directory_consent boolean not null default false,
  status public.registration_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  constraint registration_requests_email_not_blank check (length(trim(email)) > 0),
  constraint registration_requests_name_not_blank check (length(trim(name)) > 0)
);

create index companies_public_idx on public.companies (publication_status, visibility, name);
create index people_public_idx on public.people (
  publication_status,
  visibility,
  public_directory_consent,
  name
);
create index events_public_idx on public.events (publication_status, visibility, starts_at);
create index registration_requests_status_idx on public.registration_requests (status, created_at);

create or replace function public.is_admin_or_organizer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'organizer')
  );
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.people enable row level security;
alter table public.events enable row level security;
alter table public.event_person_links enable row level security;
alter table public.event_company_links enable row level security;
alter table public.registration_requests enable row level security;

create policy "public can read published public companies"
  on public.companies for select
  using (publication_status = 'published' and visibility = 'public');

create policy "admins can manage companies"
  on public.companies for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "public can read consented published public people"
  on public.people for select
  using (
    publication_status = 'published'
    and visibility = 'public'
    and public_directory_consent = true
  );

create policy "admins can manage people"
  on public.people for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "public can read published public events"
  on public.events for select
  using (publication_status = 'published' and visibility = 'public');

create policy "admins can manage events"
  on public.events for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "public can read public event people links"
  on public.event_person_links for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_person_links.event_id
        and events.publication_status = 'published'
        and events.visibility = 'public'
    )
  );

create policy "admins can manage event people links"
  on public.event_person_links for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "public can read public event company links"
  on public.event_company_links for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_company_links.event_id
        and events.publication_status = 'published'
        and events.visibility = 'public'
    )
  );

create policy "admins can manage event company links"
  on public.event_company_links for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin_or_organizer());

create policy "admins can manage profiles"
  on public.profiles for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

create policy "anyone can create registration request"
  on public.registration_requests for insert
  with check (status = 'pending');

create policy "admins can read registration requests"
  on public.registration_requests for select
  using (public.is_admin_or_organizer());

create policy "admins can manage registration requests"
  on public.registration_requests for update
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());
