alter type public.registration_request_status add value if not exists 'archived';

alter table public.profiles
  add column if not exists access_status text not null default 'active',
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references public.profiles (id) on delete set null,
  add constraint profiles_access_status_check check (access_status in ('active', 'deactivated'));

alter table public.registration_requests
  add column if not exists atlantic_canada_tie text not null default '',
  add column if not exists approved_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists approval_notice_sent_at timestamptz;

update public.registration_requests
set atlantic_canada_tie = coalesce(nullif(atlantic_canada_tie, ''), coalesce(founder_context, 'Legacy applicant context'));

create unique index if not exists registration_requests_one_pending_email_idx
  on public.registration_requests (lower(email))
  where status = 'pending';

create table if not exists public.access_audit (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  target_profile_id uuid references public.profiles (id) on delete set null,
  target_email text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint access_audit_action_not_blank check (length(trim(action)) > 0),
  constraint access_audit_target_email_not_blank check (length(trim(target_email)) > 0)
);

alter table public.access_audit enable row level security;

drop policy if exists "admins can read access audit" on public.access_audit;
create policy "admins can read access audit"
  on public.access_audit for select
  using (public.is_admin());

create index if not exists access_audit_created_at_idx
  on public.access_audit (created_at desc);

create index if not exists access_audit_target_email_idx
  on public.access_audit (lower(target_email), created_at desc);

create or replace function public.current_profile_has_access()
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
      and access_status = 'active'
      and role in ('member', 'organizer', 'admin')
  );
$$;

create or replace function public.is_admin()
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
      and role = 'admin'
      and access_status = 'active'
  );
$$;

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
      and access_status = 'active'
  );
$$;

create or replace function public.current_profile_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_settings
    join public.profiles on profiles.id = site_settings.owner_profile_id
    where owner_profile_id = auth.uid()
      and profiles.access_status = 'active'
  );
$$;

drop policy if exists "authenticated users can read published companies" on public.companies;
create policy "active members can read published companies"
  on public.companies for select
  using (public.current_profile_has_access() and publication_status = 'published');

drop policy if exists "authenticated users can read consented published people" on public.people;
create policy "active members can read consented published people"
  on public.people for select
  using (
    public.current_profile_has_access()
    and publication_status = 'published'
    and public_directory_consent = true
  );

drop policy if exists "authenticated users can read published events" on public.events;
create policy "active members can read published events"
  on public.events for select
  using (public.current_profile_has_access() and publication_status = 'published');

drop policy if exists "authenticated users can read event people links" on public.event_person_links;
create policy "active members can read event people links"
  on public.event_person_links for select
  using (
    public.current_profile_has_access()
    and exists (
      select 1 from public.events
      where events.id = event_person_links.event_id
        and events.publication_status = 'published'
    )
  );

drop policy if exists "authenticated users can read event company links" on public.event_company_links;
create policy "active members can read event company links"
  on public.event_company_links for select
  using (
    public.current_profile_has_access()
    and exists (
      select 1 from public.events
      where events.id = event_company_links.event_id
        and events.publication_status = 'published'
    )
  );

drop policy if exists "admins can manage events" on public.events;
create policy "admins and organizers can manage events"
  on public.events for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

drop policy if exists "admins can manage event people links" on public.event_person_links;
create policy "admins and organizers can manage event people links"
  on public.event_person_links for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

drop policy if exists "admins can manage event company links" on public.event_company_links;
create policy "admins and organizers can manage event company links"
  on public.event_company_links for all
  using (public.is_admin_or_organizer())
  with check (public.is_admin_or_organizer());

-- Keep people/company/content governance admin-only.
drop policy if exists "admins can manage people" on public.people;
create policy "admins can manage people"
  on public.people for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can manage companies" on public.companies;
create policy "admins can manage companies"
  on public.companies for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users can read own profile" on public.profiles;
create policy "active users can read own profile"
  on public.profiles for select
  using ((auth.uid() = id and access_status = 'active') or public.is_admin());

drop function if exists public.submit_founder_registration_request(
  text, text, text, text, text, text, text, text[], boolean, boolean
);

create or replace function public.submit_founder_registration_request(
  request_name text,
  request_email text,
  request_company_name text,
  request_company_website_url text,
  request_company_domain text,
  request_atlantic_canada_tie text,
  request_role text,
  request_founder_context text,
  request_topics text[],
  request_public_directory_consent boolean,
  request_is_company_founder boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ensured_company_id uuid;
  created_request_id uuid;
  normalized_email text := lower(trim(request_email));
  normalized_domain text := lower(trim(request_company_domain));
  normalized_slug text := trim(both '-' from regexp_replace(lower(trim(request_company_domain)), '[^a-z0-9]+', '-', 'g'));
  existing_profile public.profiles%rowtype;
begin
  if request_is_company_founder is not true then
    raise exception 'Founder affirmation is required.' using errcode = '23514';
  end if;

  if length(trim(request_name)) = 0 then
    raise exception 'Name is required.' using errcode = '23514';
  end if;

  if length(normalized_email) = 0 then
    raise exception 'Email is required.' using errcode = '23514';
  end if;

  if length(trim(request_company_name)) = 0 then
    raise exception 'Company name is required.' using errcode = '23514';
  end if;

  if length(trim(request_company_website_url)) = 0 or length(normalized_domain) = 0 then
    raise exception 'Company website is required.' using errcode = '23514';
  end if;

  if length(trim(request_atlantic_canada_tie)) = 0 then
    raise exception 'Atlantic Canada tie is required.' using errcode = '23514';
  end if;

  select * into existing_profile
  from public.profiles
  where lower(email) = normalized_email
  order by created_at desc
  limit 1;

  if existing_profile.id is not null and existing_profile.access_status = 'active' then
    raise exception 'Approved account already exists.' using errcode = '23505';
  end if;

  if existing_profile.id is not null and existing_profile.access_status = 'deactivated' then
    raise exception 'Deactivated former member requires admin review.' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.registration_requests
    where lower(email) = normalized_email
      and status = 'pending'
  ) then
    raise exception 'A pending application already exists.' using errcode = '23505';
  end if;

  insert into public.companies (
    slug,
    name,
    website_url,
    company_domain,
    publication_status,
    visibility
  )
  values (
    normalized_slug,
    trim(request_company_name),
    trim(request_company_website_url),
    normalized_domain,
    'pending_review',
    'private'
  )
  on conflict (company_domain) do nothing
  returning id into ensured_company_id;

  if ensured_company_id is null then
    select id into ensured_company_id
    from public.companies
    where company_domain = normalized_domain;
  end if;

  insert into public.registration_requests (
    name,
    email,
    company_name,
    company_website_url,
    company_domain,
    role,
    founder_context,
    atlantic_canada_tie,
    topics,
    public_directory_consent,
    is_company_founder,
    status
  )
  values (
    trim(request_name),
    normalized_email,
    trim(request_company_name),
    trim(request_company_website_url),
    normalized_domain,
    nullif(trim(coalesce(request_role, '')), ''),
    nullif(trim(coalesce(request_founder_context, request_atlantic_canada_tie, '')), ''),
    trim(request_atlantic_canada_tie),
    coalesce(request_topics, '{}'),
    coalesce(request_public_directory_consent, false),
    true,
    'pending'
  )
  returning id into created_request_id;

  return created_request_id;
end;
$$;

create or replace function public.record_access_audit(
  audit_action text,
  audit_target_email text,
  audit_target_profile_id uuid default null,
  audit_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  created_id uuid;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  insert into public.access_audit (
    actor_profile_id,
    target_profile_id,
    target_email,
    action,
    metadata
  )
  values (
    actor_id,
    audit_target_profile_id,
    lower(trim(audit_target_email)),
    audit_action,
    coalesce(audit_metadata, '{}'::jsonb)
  )
  returning id into created_id;

  return created_id;
end;
$$;

create or replace function public.mark_registration_request_approved(
  request_id uuid,
  approved_profile uuid,
  notice_sent boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  request_row public.registration_requests%rowtype;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select * into request_row
  from public.registration_requests
  where id = request_id
  for update;

  if request_row.id is null then
    raise exception 'Registration request not found.' using errcode = '23503';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Only pending applications can be approved.' using errcode = '23514';
  end if;

  update public.registration_requests
  set status = 'approved',
      reviewed_at = now(),
      reviewed_by = actor_id,
      approved_profile_id = approved_profile,
      approval_notice_sent_at = case when notice_sent then now() else approval_notice_sent_at end
  where id = request_id;

  insert into public.access_audit (
    actor_profile_id,
    target_profile_id,
    target_email,
    action,
    metadata
  ) values (
    actor_id,
    approved_profile,
    request_row.email,
    'approve',
    jsonb_build_object('registration_request_id', request_id)
  );
end;
$$;

create or replace function public.archive_registration_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  request_row public.registration_requests%rowtype;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select * into request_row
  from public.registration_requests
  where id = request_id
  for update;

  if request_row.id is null then
    raise exception 'Registration request not found.' using errcode = '23503';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Only pending applications can be archived.' using errcode = '23514';
  end if;

  update public.registration_requests
  set status = 'archived',
      reviewed_at = now(),
      reviewed_by = actor_id
  where id = request_id;

  insert into public.access_audit (
    actor_profile_id,
    target_email,
    action,
    metadata
  ) values (
    actor_id,
    request_row.email,
    'archive',
    jsonb_build_object('registration_request_id', request_id)
  );
end;
$$;

create or replace function public.deactivate_profile(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  target_row public.profiles%rowtype;
  owner_id uuid;
begin
  if actor_id is null or not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  select * into target_row
  from public.profiles
  where id = target_profile_id
  for update;

  if target_row.id is null then
    raise exception 'Target profile not found.' using errcode = '23503';
  end if;

  select owner_profile_id into owner_id from public.site_settings where id = true;
  if owner_id = target_profile_id then
    raise exception 'Owner must transfer ownership before deactivation.' using errcode = '23514';
  end if;

  update public.profiles
  set access_status = 'deactivated',
      deactivated_at = now(),
      deactivated_by = actor_id,
      updated_at = now()
  where id = target_profile_id;

  insert into public.access_audit (
    actor_profile_id,
    target_profile_id,
    target_email,
    action
  ) values (
    actor_id,
    target_profile_id,
    target_row.email,
    'deactivate'
  );
end;
$$;

revoke all on function public.submit_founder_registration_request(
  text, text, text, text, text, text, text, text, text[], boolean, boolean
) from public;
revoke all on function public.record_access_audit(text, text, uuid, jsonb) from public;
revoke all on function public.mark_registration_request_approved(uuid, uuid, boolean) from public;
revoke all on function public.archive_registration_request(uuid) from public;
revoke all on function public.deactivate_profile(uuid) from public;

grant execute on function public.submit_founder_registration_request(
  text, text, text, text, text, text, text, text, text[], boolean, boolean
) to anon, authenticated;
grant execute on function public.record_access_audit(text, text, uuid, jsonb) to authenticated;
grant execute on function public.mark_registration_request_approved(uuid, uuid, boolean) to authenticated;
grant execute on function public.archive_registration_request(uuid) to authenticated;
grant execute on function public.deactivate_profile(uuid) to authenticated;
