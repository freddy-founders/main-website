insert into public.companies (
  slug,
  name,
  tagline,
  category,
  stage,
  location_label,
  website_url,
  publication_status,
  visibility
)
values (
  'river-signal-labs',
  'River Signal Labs',
  'Operational intelligence for field-heavy companies.',
  'B2B SaaS',
  'Seed',
  'Fredericton, NB',
  'https://example.com',
  'published',
  'public'
)
on conflict (slug) do nothing;

insert into public.people (
  slug,
  name,
  role,
  company_name,
  location_label,
  founder_context,
  topics,
  public_directory_consent,
  publication_status,
  visibility
)
values (
  'amelia-foster',
  'Amelia Foster',
  'Founder',
  'River Signal Labs',
  'Fredericton, NB',
  'Building workflow tools for field teams.',
  array['B2B SaaS', 'Construction', 'AI'],
  true,
  'published',
  'public'
),
(
  'private-founder',
  'Private Founder',
  'Founder',
  'Stealth Co',
  'Fredericton, NB',
  'Not for public directory display.',
  array['Privacy'],
  false,
  'published',
  'private'
)
on conflict (slug) do nothing;

insert into public.events (
  slug,
  title,
  starts_at,
  location_label,
  summary,
  registration_mode,
  registration_url,
  registration_label,
  capacity_status,
  publication_status,
  visibility
)
values (
  'founder-breakfast',
  'Founder Breakfast',
  '2026-06-04T12:30:00.000Z',
  'Downtown Fredericton',
  'A focused morning table for founders comparing current operating constraints.',
  'external',
  'https://example.com/freddy-founders-breakfast',
  'Register externally',
  'open',
  'published',
  'public'
),
(
  'operator-roundtable',
  'Operator Roundtable',
  '2026-06-18T21:00:00.000Z',
  'Fredericton Knowledge Park',
  'A small operator session for hiring, GTM, and finance questions.',
  'disabled',
  null,
  'Coming soon',
  'limited',
  'published',
  'public'
)
on conflict (slug) do nothing;

insert into public.registration_requests (
  name,
  email,
  company_name,
  role,
  founder_context,
  topics,
  public_directory_consent,
  status
)
values (
  'Pending Member',
  'pending@example.com',
  'Example Co',
  'Founder',
  'Exploring Freddy Founders membership.',
  array['Fundraising'],
  false,
  'pending'
);
