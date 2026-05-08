create table if not exists public.site_settings (
  id boolean primary key default true,
  owner_profile_id uuid references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = true)
);

create table if not exists public.profile_role_audit (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  target_profile_id uuid not null references public.profiles (id) on delete cascade,
  previous_role public.account_role not null,
  next_role public.account_role not null,
  reason text,
  created_at timestamptz not null default now()
);

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
    where owner_profile_id = auth.uid()
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
  );
$$;

drop policy if exists "admins can manage companies" on public.companies;
create policy "admins can manage companies"
  on public.companies for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can manage people" on public.people;
create policy "admins can manage people"
  on public.people for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can manage events" on public.events;
create policy "admins can manage events"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can manage event people links" on public.event_person_links;
create policy "admins can manage event people links"
  on public.event_person_links for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can manage event company links" on public.event_company_links;
create policy "admins can manage event company links"
  on public.event_company_links for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "admins can manage profiles" on public.profiles;
create policy "admins can manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can read registration requests" on public.registration_requests;
create policy "admins can read registration requests"
  on public.registration_requests for select
  using (public.is_admin());

drop policy if exists "admins can manage registration requests" on public.registration_requests;
create policy "admins can manage registration requests"
  on public.registration_requests for update
  using (public.is_admin())
  with check (public.is_admin());

alter table public.site_settings enable row level security;
alter table public.profile_role_audit enable row level security;

create policy "admins can read site settings"
  on public.site_settings for select
  using (public.is_admin());

create policy "admins can read profile role audit"
  on public.profile_role_audit for select
  using (public.is_admin());

create or replace function public.admin_bootstrap_owner(owner_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if exists (select 1 from public.site_settings where owner_profile_id is not null) then
    raise exception 'Site owner already exists.' using errcode = '23505';
  end if;

  select id into target_id
  from public.profiles
  where lower(email) = lower(trim(owner_email));

  if target_id is null then
    raise exception 'No profile found for owner email.' using errcode = '23503';
  end if;

  update public.profiles
  set role = 'admin', updated_at = now()
  where id = target_id;

  insert into public.site_settings (id, owner_profile_id)
  values (true, target_id)
  on conflict (id) do update
  set owner_profile_id = excluded.owner_profile_id,
      updated_at = now();

  return target_id;
end;
$$;

create or replace function public.set_profile_role(
  target_profile_id uuid,
  next_role public.account_role,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.account_role;
  target_current_role public.account_role;
  owner_id uuid;
  admin_count integer;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select role into actor_role from public.profiles where id = actor_id;
  select role into target_current_role from public.profiles where id = target_profile_id;
  select owner_profile_id into owner_id from public.site_settings where id = true;

  if target_current_role is null then
    raise exception 'Target profile not found.' using errcode = '23503';
  end if;

  if actor_id <> target_profile_id then
    if actor_role = 'admin' then
      null;
    elsif actor_role = 'organizer' and target_current_role = 'member' and next_role = 'organizer' then
      null;
    else
      raise exception 'Insufficient role permission.' using errcode = '42501';
    end if;
  else
    if next_role <> 'member' then
      raise exception 'Self-service role change can only demote to member.' using errcode = '42501';
    end if;
  end if;

  if owner_id = target_profile_id and next_role <> 'admin' then
    raise exception 'Owner must remain an admin. Transfer ownership first.' using errcode = '23514';
  end if;

  if target_current_role = 'admin' and next_role <> 'admin' then
    select count(*) into admin_count from public.profiles where role = 'admin';
    if admin_count <= 1 then
      raise exception 'Cannot demote the last admin.' using errcode = '23514';
    end if;
  end if;

  if target_current_role = next_role then
    return;
  end if;

  update public.profiles
  set role = next_role, updated_at = now()
  where id = target_profile_id;

  insert into public.profile_role_audit (
    actor_profile_id,
    target_profile_id,
    previous_role,
    next_role,
    reason
  )
  values (
    actor_id,
    target_profile_id,
    target_current_role,
    next_role,
    reason
  );
end;
$$;

create or replace function public.transfer_site_owner(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  previous_owner_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  select owner_profile_id into previous_owner_id
  from public.site_settings
  where id = true;

  if previous_owner_id is distinct from actor_id then
    raise exception 'Only the current owner can transfer ownership.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = target_profile_id) then
    raise exception 'Target profile not found.' using errcode = '23503';
  end if;

  update public.profiles
  set role = 'admin', updated_at = now()
  where id in (actor_id, target_profile_id);

  insert into public.site_settings (id, owner_profile_id)
  values (true, target_profile_id)
  on conflict (id) do update
  set owner_profile_id = excluded.owner_profile_id,
      updated_at = now();
end;
$$;

revoke all on function public.admin_bootstrap_owner(text) from public;
revoke all on function public.set_profile_role(uuid, public.account_role, text) from public;
revoke all on function public.transfer_site_owner(uuid) from public;

grant execute on function public.set_profile_role(uuid, public.account_role, text) to authenticated;
grant execute on function public.transfer_site_owner(uuid) to authenticated;
