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

revoke all on function public.can_request_member_login(text) from public;
grant execute on function public.can_request_member_login(text) to anon, authenticated;
