alter table public.profiles
  add column if not exists password_reset_required boolean not null default false,
  add column if not exists temporary_password_issued_at timestamptz;

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
      and password_reset_required is false
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
      and password_reset_required is false
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
      and password_reset_required is false
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
      and profiles.password_reset_required is false
  );
$$;

create or replace function public.can_request_member_login(request_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where lower(email) = lower(trim(request_email))
      and access_status = 'active'
      and role in ('member', 'organizer', 'admin')
  );
$$;

create or replace function public.complete_required_password_reset()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '28000';
  end if;

  update public.profiles
  set password_reset_required = false,
      temporary_password_issued_at = null,
      updated_at = now()
  where id = auth.uid()
    and access_status = 'active';

  if not found then
    raise exception 'Active profile not found.' using errcode = '23503';
  end if;
end;
$$;

revoke all on function public.complete_required_password_reset() from public;
grant execute on function public.complete_required_password_reset() to authenticated;
