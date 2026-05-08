insert into public.companies (
  slug,
  name,
  tagline,
  category,
  stage,
  location_label,
  website_url,
  company_domain,
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
  'example.com',
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
  'june-operator-dinner',
  'June Operator Dinner: AI Workflows in Local Services',
  '2026-06-13T18:30:00.000-03:00',
  'Fredericton',
  'Small dinner for founders and operators building repeatable sales, service delivery, and AI-assisted workflows.',
  'internal',
  null,
  'RSVP',
  'open',
  'published',
  'public'
),
(
  'hiring-first-sales',
  'Hiring First Sales: Founder Office Hours',
  '2026-06-26T12:00:00.000-03:00',
  'Zoom',
  'Peer session for founders moving from founder-led sales into first sales hire systems and expectations.',
  'external',
  'https://example.com/freddy-founders-sales-office-hours',
  'Register',
  'open',
  'published',
  'public'
),
(
  'founder-breakfast-pricing',
  'Founder Breakfast: Pricing and Unit Economics',
  '2026-07-09T08:30:00.000-03:00',
  'Fredericton',
  'Small breakfast for founders comparing pricing models, margins, and finance operating rhythms.',
  'disabled',
  null,
  'Waitlist',
  'waitlist',
  'published',
  'public'
),
(
  'local-services-roundtable',
  'Local Services Operator Roundtable',
  '2026-04-22T16:00:00.000-03:00',
  'Fredericton',
  'Archived operator session for local services founders.',
  'disabled',
  null,
  'Past',
  'unknown',
  'published',
  'public'
)
on conflict (slug) do nothing;

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
  'Pending Member',
  'pending@example.com',
  'Example Co',
  'https://example.com',
  'example.com',
  'Founder',
  'Exploring Freddy Founders membership.',
  array['Fundraising'],
  false,
  true,
  'pending'
);
