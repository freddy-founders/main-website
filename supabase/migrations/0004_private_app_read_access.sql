drop policy if exists "public can read published public companies" on public.companies;
create policy "authenticated users can read published companies"
  on public.companies for select
  using (auth.uid() is not null and publication_status = 'published');

drop policy if exists "public can read consented published public people" on public.people;
create policy "authenticated users can read consented published people"
  on public.people for select
  using (
    auth.uid() is not null
    and publication_status = 'published'
    and public_directory_consent = true
  );

drop policy if exists "public can read published public events" on public.events;
create policy "authenticated users can read published events"
  on public.events for select
  using (auth.uid() is not null and publication_status = 'published');

drop policy if exists "public can read public event people links" on public.event_person_links;
create policy "authenticated users can read event people links"
  on public.event_person_links for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.events
      where events.id = event_person_links.event_id
        and events.publication_status = 'published'
    )
  );

drop policy if exists "public can read public event company links" on public.event_company_links;
create policy "authenticated users can read event company links"
  on public.event_company_links for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.events
      where events.id = event_company_links.event_id
        and events.publication_status = 'published'
    )
  );
