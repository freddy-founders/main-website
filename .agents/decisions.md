# Decisions

## 2026-05-08 — Use YC-style utility community design language

The community hub mock should be similar in spirit to Y Combinator community products such as Bookface and Hacker News. This shifts the design direction away from a polished marketing/community landing page and toward a dense, utility-first community operating surface: text-heavy, fast to scan, clear navigation, forum/feed/directory patterns, minimal visual ornament, and strong emphasis on current activity and member context.

Rationale: the product is doing a similar job — making a professional network legible, searchable, and active for organizers and members.

Open nuance: Bookface is private, so public references should lean on Hacker News, YC directory pages, and the user's description of Bookface-like community utility.

## 2026-05-08 — Apply blue industrial brutalist visual direction

The mock should use the requested `industrial-brutalist-ui` skill direction from `Leonxlnx/taste-skill`, choosing the Swiss Industrial Print archetype rather than Tactical Telemetry. The interface should use rigid grids, visible compartment borders, uppercase macro typography, monospace metadata, square corners, dense information, and minimal ornament.

The requested color direction overrides the skill's default red accent: use blue as the single accent color for structural bars, active navigation, ranks, and key controls.

Rationale: this preserves the YC/HN/Bookface utility job while giving the product a distinctive blueprint/admin-console identity.

## 2026-05-08 — Rebalance with normal Taste Skill hierarchy and palette variants

The industrial brutalist direction was visually interesting but the hierarchy was not strong enough. The admin mock now follows the normal `design-taste-frontend` skill more closely: clearer primary hero/status area, one obvious quick-publish workflow, calmer density, rounded surfaces, and grouped work sections.

Palette choice is intentionally unresolved. Current variants:

- Civic Blue: cool operational palette with reduced saturation.
- YC Warm: closest to Hacker News / Y Combinator lineage.
- Freddy Brick: warmer local/civic palette for the Freddy Founders identity.

Rationale: validate hierarchy independently from palette before choosing the canonical visual system.

## 2026-05-08 — Restore brutalist direction after normal Taste Skill rejection

The normal Taste Skill/palette-variant revision was rejected as worse. Restore the industrial brutalist direction as the stronger visual baseline: sharp grid, macro typography, dense admin surfaces, square corners, monospace metadata, and YC-style utility.

Open issue: accent color is still unresolved. Future palette exploration should keep the brutalist layout/hierarchy intact and vary only color tokens, not the structure.

## 2026-05-08 — Compare brutalist palettes without changing structure

Palette exploration now keeps the restored brutalist admin layout intact and varies only accent/paper color tokens. Current palette variants are Blueprint Blue, YC Orange, Freddy Brick, and River Green.

Rationale: user liked the brutalist direction and specifically rejected the softer normal Taste Skill layout; color should be evaluated independently from structure.

## 2026-05-08 — Needs Attention uses issue-tracker grammar

The admin `Needs Attention` area should not read like a feed of post titles. It should read like an issue tracker: stable issue IDs, status labels, priority, owner, due/source metadata, and a concrete next action.

Rationale: this surface is for organizer operations, not member content discovery. The public/member feed can keep post-title grammar; admin work should feel triageable and accountable.

## 2026-05-08 — Split first-time member flow into dedicated public pages

The first-time/start page was too dense and overwhelming. Replace the single overloaded Start Here page with separate public/member pages so users can progressively disclose detail instead of parsing everything at once.

Superseded detail: an intermediate version included Posts/Forum, Resources, and heavier people context on the first page. Current MVP removes Posts/Forum and Resources, and keeps Home narrow.

Rationale: new users need progressive disclosure. Home should show the next event and routes into deeper event context; dedicated pages carry the deeper content.

## 2026-05-08 — MVP entities are Events, People, and Companies

Forum/posts and resources are removed from MVP navigation and mocks. The MVP entity model now focuses on **Events**, **People**, and **Companies**.

The primary public user action is still RSVP/register for events, similar to Eventbrite. Companies are a YC-style directory surface that helps users understand which companies are in the network and how they connect to people/events.

Rationale: event registration is the clearest member conversion/action, people context supports deciding whom to meet, and company context supports Bookface/YC-style network discovery without becoming a broad community platform.

## 2026-05-08 — Public pages are Events, People, Companies, and Auth

Earlier Home/Calendar/News naming was superseded. Current public nav is **Events / People / Companies / Login / Register**. Current admin nav is **Events / People / Companies / Admin**.

Events is the default public front page and RSVP/register surface. Event Detail carries the “why attend?” and “who is relevant to meet?” context. People provides the broader person directory. Companies provides the YC-style company directory. Login and Register provide account access without gating public browsing.

A linked sidecar spec file should sit next to the mock HTML so each page can be reviewed with user stories, affordances, spec notes, and feedback prompts.

## 2026-05-08 — Relevant people belong on Event Detail, not Events list

The Events front page should stay narrowly event-conversion focused. If users need to understand which people are connected to an event, that context should live on an **Event Detail** page rather than directly on the Events list.

Implication:

- Events = upcoming event list + RSVP/register
- Event Detail = why attend + relevant people
- People = secondary person directory/index
- Companies = secondary YC-style company directory/index

## 2026-05-08 — Simplify to Bookface + Events + Companies

Latest product direction supersedes the broader "community hub" framing. The user wants a simple public Events list, public People/users directory, and YC-style Companies directory.

Implications:

- Events is the default public front page.
- People is a Bookface-like directory/index, not a feed.
- Companies is a YC Startup Directory-like index, not a vendor marketplace.
- Event Detail is optional, only when a row needs more "why attend / who to meet" context.
- Person Detail can be a page or row expansion, only if a people row is not enough.
- Company Detail can be a page or row expansion, only if a company row is not enough.
- Do not add forum, resources, social graph, messaging, voting, comments, ranking, or fancy community-platform features.
- Admin should stay simple maintenance/CRUD unless the maintenance burden proves it needs more.

## 2026-05-08 — Nine-page spec

The product spec should now cover nine pages:

- Events
- Event Detail
- People
- Person Detail / Row Expansion
- Companies
- Company Detail
- Login
- Registration
- Admin Maintenance

Each page spec should detail user stories, affordances, and page design. Remove separate Home, Calendar, PRD Pass, session decisions, and teardown pages from the spec HTML. Keep the product simple: public Events + public People + public Companies + lightweight auth, with optional detail surfaces and simple admin maintenance.

## 2026-05-08 — Public right sidebar uses rail layout, spec content

Public list pages should use the right-sidebar/rail layout because it supports scanning, filters, and context. The content should not copy Reddit sections literally. It should match each page spec:

- page context
- lightweight stats
- filters
- visible fields / row anatomy
- boundaries / public-safe rules only where relevant

This sidebar should support scanning and trust, not become a marketing panel. On mobile it can stack below the main content.

## 2026-05-08 — Remove public title banners in favor of sidebar context

Public pages should not use large title banners above the main content. Instead, the page title, short description, lightweight stats, and similar context should live in the right sidebar on desktop.

Implications:

- Events starts directly with the event list
- Event Detail starts directly with event context blocks
- People starts directly with the directory list
- Person Detail keeps main content utility-first while summary/facts move into the right sidebar
- On mobile, the sidebar content stacks below the main content

## 2026-05-08 — Companies directory should follow YC Companies function

Companies are now an MVP public entity alongside Events and People. The Companies page should serve a similar function to YC Startup Directory: compact searchable/filterable company rows with tagline, industry/category, location, status/stage, company-size/team signal if public-safe, related people, and related events.

Company Detail should resemble YC company detail in function, not styling: concise company summary, public facts, website/contact path when approved, related people/founders, related events, and optional public updates/news. It must not become a vendor marketplace, sales directory, or marketing landing page.

## 2026-05-08 — Add lightweight login and registration

The app should include Login and Registration surfaces while preserving the current public site direction.

Implications:

- Public browsing for Events, People, and Companies should remain available without login.
- Login is for returning members, organizers, and admins.
- Registration is a lightweight account request/create-account flow, not a social-network signup.
- Registration should capture enough context for trust and directory usefulness: name, email, company/role, founder/operator context, topics, and public-directory consent.
- Public profiles/company display must be consent-aware and not auto-published from registration.
- Admin Maintenance should include pending registration/account review.

## 2026-05-08 — Scaffold Everything as Code architecture

The repo scaffold should make architecture and operations code-owned from the start.

Locked implementation baseline:

- Cloudflare deployment substrate via `wrangler.jsonc`.
- Supabase Postgres/Auth/RLS via migrations, seed data, and generated TypeScript types.
- Vite + React + React Router library for the frontend.
- Ports and adapters architecture: domain/application depend on `src/ports`, with infrastructure in `src/adapters`.
- Style Dictionary compiles repo-owned JSON design tokens to CSS variables.
- Cucumber feature files codify product-facing requirements as executable BDD.
- Vitest unit tests codify TDD-level domain/application behavior.
- Terraform owns provider/account/resource configuration once real provider resources are known.
- Mermaid `.mmd` diagrams under `architecture/` are canonical architecture-as-code artifacts.
- Git hooks under `.githooks/` enforce formatting, tokens, typecheck, unit tests, and BDD before commit.

Rationale: this preserves the Everything-as-Code principle without adding server/config-management ceremony that does not apply to a managed Cloudflare + Supabase app.

## 2026-05-08 — Trunk pushes auto-deploy through code-owned CI/CD

The canonical trunk branch is `main`. Pull requests and pushes run the Everything-as-Code CI gates. Any push to `main` should run CI and then deploy to Cloudflare through GitHub Actions.

The canonical Cloudflare deployment target is **Workers with Static Assets**, not Pages. The Worker is the application origin and uses custom domains for `freddyfounders.com` and `www.freddyfounders.com`.

Deployment automation is code-owned in:

- `.github/workflows/verify.yml`
- `wrangler.jsonc`
- `scripts/deploy-cloudflare.sh`
- `scripts/bootstrap-github-cd.sh`
- `mise.toml`
- `package.json`

Required secret material stays outside git:

- GitHub secret `CLOUDFLARE_API_TOKEN`
- GitHub variable `CLOUDFLARE_ACCOUNT_ID`
- Cloudflare DNS zone ownership for `freddyfounders.com`

Rationale: code should define the CI/CD pipeline and deploy shape, while secret values remain provider/GitHub-managed.

## 2026-05-08 — Design library is canonical and repo-enforced

Freddy Founders should have a formal design library, not page-local styling. The canonical design surface is `src/design/`.

Design source-of-truth flow:

- `tokens/source/core.json` owns raw token decisions.
- Style Dictionary generates `src/styles/generated/tokens.css`.
- `src/design/design-system.css` owns private `ff-*` classes and visual grammar.
- `src/design/foundations` owns internal helpers and strict prop helpers.
- `src/design/primitives` owns small canonical UI atoms.
- `src/design/composites` owns composed layout/content units.
- `src/design/patterns` owns larger reusable product/catalog shapes.
- `src/design/registry.ts` documents each component's taxonomy category/status policy.
- `src/design/README.md` documents the contract.

Enforcement:

- app pages must import only from the public `src/design` API.
- app pages must not reference private `ff-*` classes directly.
- app pages must not import internal design subpaths.
- raw color values belong in token source/generated output, not app code.
- design components must not expose `className` or `style` props by default.
- exported primitives/composites/patterns must be listed in `designComponentRegistry`.
- `pnpm design:check` runs in precommit and GitHub Actions before deploy.

Rationale: this keeps the mock-derived visual language maintainable and prevents drift back into ad hoc CSS.

## 2026-05-08 — Layout frame is centered, aligned, and tight

The Freddy Founders topbar, stripe, and page content should share one centered frame width. The topbar must not span the full viewport while the content sits in a narrower slab.

The canonical visual mode remains Swiss Industrial Print from the brutalist reference: light paper substrate, brick accent, hard borders, deterministic grid, square corners, uppercase metadata, and tight compartmentalized information density.

The Freddy Founders mark is `FF`, and the repo-owned site icon is a white-on-brick `FF` square at `public/site-icon.svg`. Primary navigation belongs in the left command line as `Freddy Founders / Events / People / Companies`; Login/Register remain boxed account actions on the right. The current page is indicated with an underline, not a filled nav button. Slash separators are structural dividers and must never receive active-page underlines.

Rationale: the page should read as one engineered artifact, not disconnected full-width header plus floating content card.

## 2026-05-08 — Events page decomposes into operational board primitives

The current Events reference is not the earlier generic panel/list layout. It decomposes into an operational board grammar:

- command topbar with inline primary nav and underlined current page
- aligned stripe and content frame
- primary board column
- bracketed section bars
- schedule rows with date marker, title, metadata, copy, tags, and actions
- right spec panel with macro `Events` title, context, notes, and stat cells
- filter chip bar
- numbered field-list explainer rows

These are now canonical design composites in `src/design/composites/board.tsx`, backed by `src/design/design-system.css` and `src/design/registry.ts`.

Rationale: the live Events page should match the new tighter reference grammar directly, while keeping the design library as the source of reusable layout primitives.

## 2026-05-08 — Supabase is activation-ready and can back runtime adapters

The app composition root now uses Supabase adapters when browser-safe Supabase runtime env exists:

- `VITE_DATA_SOURCE=auto` uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present, otherwise memory fixtures.
- `VITE_DATA_SOURCE=supabase` requires Supabase env and fails fast if missing.
- `VITE_DATA_SOURCE=memory` forces in-memory fixtures.

The linked Supabase project is `vnhuiwxavsplhbmwvctx` at `https://vnhuiwxavsplhbmwvctx.supabase.co`. Migrations were pushed to the linked project, seed data was applied, and generated database types now come from the remote project.

Secrets remain outside git. The repo owns activation scripts and env contracts, not provider secret values.

## 2026-05-08 — Environment, smoke, and Terraform setup are code-owned gates

Environment validation is now a repo gate via `scripts/check-env-contract.mjs` / `pnpm env:check`. It checks `.env.example`, validates runtime data-source mode, and validates provider/runtime value shapes without requiring secrets in normal CI.

Production-preview route smoke lives in `scripts/smoke-routes.mjs` / `pnpm smoke:routes`. It starts Vite preview from `dist`, verifies public routes serve the app shell, and verifies the site icon asset.

Terraform setup now includes:

- `infra/terraform/terraform.tfvars.example`
- optional Supabase project ownership variables/resources
- `scripts/terraform-plan.sh`
- `pnpm tf:plan`

Terraform continues to own DNS/provider setup boundaries; Supabase schema/RLS remains migration-owned.

## 2026-05-08 — Production Terraform auto-apply is configured behind an explicit flag

Trunk can run production Terraform auto-apply before Cloudflare deploy when `TERRAFORM_AUTO_APPLY=true` and `CLOUDFLARE_TERRAFORM_API_TOKEN` has DNS read/edit permission. The workflow order is:

```text
CI gates -> Terraform validation -> optional Terraform auto-apply -> Cloudflare deploy
```

The current prod Terraform ownership surface is intentionally narrow: Cloudflare DNS plus optional future provider/project setup. Existing `www.freddyfounders.com` DNS is imported at plan time through Terraform config-driven import so trunk can enforce the record without manual local state.

The first auto-apply attempt proved the existing deploy token only has Workers permissions and cannot read DNS records. Auto-apply is therefore gated off until a DNS-capable Cloudflare Terraform token is installed. This is acceptable for the current DNS-only prod surface. Before using Terraform for stateful or sensitive resources, add durable remote state/locking and avoid storing sensitive provider-created values in transient CI state.
