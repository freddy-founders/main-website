alter table public.companies
  add column if not exists company_domain text;

update public.companies
set company_domain = lower(regexp_replace(website_url, '^https?://(www\.)?([^/]+).*$', '\2'))
where company_domain is null
  and website_url is not null;

create unique index if not exists companies_company_domain_key
  on public.companies (company_domain);

alter table public.registration_requests
  add column if not exists company_website_url text,
  add column if not exists company_domain text,
  add column if not exists is_company_founder boolean not null default false;

update public.registration_requests
set
  company_website_url = coalesce(company_website_url, ''),
  company_domain = coalesce(company_domain, lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'))),
  is_company_founder = coalesce(is_company_founder, false)
where company_website_url is null
   or company_domain is null;

alter table public.registration_requests
  alter column company_website_url set not null,
  alter column company_domain set not null;

create index if not exists registration_requests_company_domain_idx
  on public.registration_requests (company_domain, status, created_at);

drop policy if exists "anyone can create registration request" on public.registration_requests;

create or replace function public.submit_founder_registration_request(
  request_name text,
  request_email text,
  request_company_name text,
  request_company_website_url text,
  request_company_domain text,
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
  normalized_domain text := lower(trim(request_company_domain));
  normalized_slug text := trim(both '-' from regexp_replace(lower(trim(request_company_domain)), '[^a-z0-9]+', '-', 'g'));
begin
  if request_is_company_founder is not true then
    raise exception 'Founder affirmation is required.' using errcode = '23514';
  end if;

  if length(trim(request_name)) = 0 then
    raise exception 'Name is required.' using errcode = '23514';
  end if;

  if length(trim(request_email)) = 0 then
    raise exception 'Email is required.' using errcode = '23514';
  end if;

  if length(trim(request_company_name)) = 0 then
    raise exception 'Company name is required.' using errcode = '23514';
  end if;

  if length(trim(request_company_website_url)) = 0 or length(normalized_domain) = 0 then
    raise exception 'Company website is required.' using errcode = '23514';
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
    topics,
    public_directory_consent,
    is_company_founder,
    status
  )
  values (
    trim(request_name),
    lower(trim(request_email)),
    trim(request_company_name),
    trim(request_company_website_url),
    normalized_domain,
    nullif(trim(coalesce(request_role, '')), ''),
    nullif(trim(coalesce(request_founder_context, '')), ''),
    coalesce(request_topics, '{}'),
    coalesce(request_public_directory_consent, false),
    true,
    'pending'
  )
  returning id into created_request_id;

  return created_request_id;
end;
$$;

revoke all on function public.submit_founder_registration_request(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  boolean,
  boolean
) from public;

grant execute on function public.submit_founder_registration_request(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  boolean,
  boolean
) to anon, authenticated;
