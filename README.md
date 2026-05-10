# Freddy Founders

Everything-as-Code scaffold for the Freddy Founders private founder community app.

## Stack

- Cloudflare deployment substrate via `wrangler.jsonc`
- Vite + React + React Router library
- Ports and adapters application architecture
- Supabase Postgres/Auth/RLS via SQL migrations
- Style Dictionary design tokens
- Cucumber executable requirements
- Vitest unit tests for TDD
- Terraform provider/resource skeletons
- GitHub Actions verification

## Architecture

Canonical Mermaid diagrams live in `architecture/`:

- `architecture/system.mmd`
- `architecture/ports-and-adapters.mmd`
- `architecture/verification-pipeline.mmd`
- `architecture/test-infrastructure.mmd`

Primary code layers:

```text
src/domain        pure domain models and policies
src/application   use-cases and application services
src/ports         interfaces the core depends on
src/adapters      infrastructure implementations
src/styles        generated and semantic design tokens
```

## Setup

```bash
mise install
mise run install
mise run hooks:install
```

`mise run hooks:install` configures the repo to use `.githooks/` and enables Git LFS hooks locally.

Dependency install-script approvals are code-owned in `package.json` / `pnpm-workspace.yaml` so required packages such as `esbuild`, `sharp`, and `workerd` can build without an interactive prompt.

Copy `.env.example` to `.env` when real Supabase/Cloudflare values exist. Never commit service-role keys or provider tokens. `VITE_DATA_SOURCE=auto` uses Supabase when browser-safe Supabase env vars exist and falls back to in-memory fixtures otherwise; set `VITE_DATA_SOURCE=supabase` to fail fast if Supabase values are missing.

Production auth is approved-profile-only:

- the public `/register` form creates a pending founder/company application
- admins approve or archive applications
- approval creates or reuses the Supabase Auth user, upserts an active profile, issues a temporary password, marks password reset required, and records audit state
- approved users log in with email + password from `/login`
- temporary passwords must be replaced on `/reset-password` before private app access
- login never creates a new account
- deactivated profiles lose private app access and cannot use password login

Admin governance uses cumulative roles: `member < organizer < admin`. The `/admin` page is admin-only, only admins can promote users to admin, organizers can promote members to organizers through the backend role boundary, and ownership is a singleton capability stored separately from the role. The owner must remain an admin; first-owner bootstrap is a manual setup SQL operation once the owner profile exists. `/admin/integrations` is also admin-only and shows whether the server-side Gemini API key model is configured for company intelligence.

## Development

```bash
mise run dev
```

## Verification

```bash
mise run env:check
mise run tokens:build
mise run design:check
mise run action:check
mise run model:check
mise run model:test
mise run action:rendered
mise run test:unit
mise run bdd
mise run check
mise run build
mise run smoke:routes
mise run tf:init
mise run tf:validate
```

Testing infrastructure is Everything as Code:

```text
src/domain/userActions.ts
  -> productCapabilities: Capability -> native Cucumber Feature files
  -> actionCapabilities: action leaves with actor, surface, risk, auth, boundary, verification
  -> userActionWorkflows: stateful MBT models and required coverage
features/*.feature
  -> native Cucumber Features tagged with @capability.<id>
  -> Scenarios tagged with @action.<action-id> when they exercise user-visible actions
scripts/check-action-coverage.mjs
  -> manifest Capability -> Feature -> Scenario/action traceability
  -> static source action annotation checks
scripts/check-model-workflow-coverage.mjs
  -> MBT obligation gate for states, transitions, and forbidden transitions
scripts/test-model-workflows.mjs
  -> executable deterministic model tests against application/domain services
scripts/check-rendered-actions.mjs
  -> render-phase route audit for exposed buttons, links, and forms
```

A product capability lists its Cucumber feature files and required action leaves. A Cucumber Feature must carry a matching `@capability.<id>` tag, and scenarios under those features must provide the required `@action.<action-id>` coverage. An action that requires `mbt` must declare a workflow id, appear as an event in that workflow, have workflow coverage for states, transitions, and forbidden transitions, and pass executable model tests against the application/domain service seam. CI fails closed when any required coverage is missing.

Supabase activation for a real project:

```bash
SUPABASE_ACCESS_TOKEN=... \
SUPABASE_PROJECT_REF=... \
VITE_SUPABASE_URL=... \
VITE_SUPABASE_ANON_KEY=... \
mise run supabase:activate
```

Then set `VITE_DATA_SOURCE=supabase`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in the deployment environment to use Supabase-backed adapters.

Production auth lifecycle also needs a server-only Worker secret:

```bash
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

This secret is used only by the Cloudflare Worker admin API for approval/archive/deactivation and must never be exposed to the browser.

Application intake is also server-enforced: the Worker must successfully fetch/scrape the submitted company website and pass a business-evidence gate before creating a pending application. By default this uses credentialless deterministic evidence. When `GEMINI_API_KEY` is configured, the Worker calls the official Gemini API with Google Search grounding for server-side company validation/enrichment.

Google AI API key mode needs one server-only Cloudflare secret:

```bash
pnpm exec wrangler secret put GEMINI_API_KEY
```

`GEMINI_MODEL` is a non-secret Worker var in `wrangler.jsonc` and defaults to `gemini-2.5-flash`.

Terraform local setup:

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... mise run tf:plan
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... mise run tf:apply
```

Terraform owns optional future provider/account setup. Supabase schema/RLS remains migration-owned in `supabase/migrations/`. Trunk can auto-apply production Terraform before deployment when `TERRAFORM_AUTO_APPLY=true` and GitHub secret `CLOUDFLARE_API_TOKEN` includes both Workers deploy permissions and Cloudflare Zone DNS read/edit permission for `freddyfounders.com`. Workers custom-domain bindings already own the live host records, so Terraform intentionally does not create duplicate DNS records for `freddyfounders.com` or `www.freddyfounders.com`. Add remote state before using Terraform for stateful/sensitive resources.

The pre-commit hook runs:

```text
formatting -> design tokens -> env contract -> design contract -> action/capability contract -> model workflow contract -> rendered action audit -> typecheck -> TDD unit tests -> BDD requirements
```

## Trunk CI/CD

The canonical trunk is `main`.

Automation lives in `.github/workflows/verify.yml` and is code-owned:

```text
pull_request -> CI gates + Terraform validation
push main    -> CI gates -> Terraform validation -> optional Terraform auto-apply -> Cloudflare deploy
```

Terraform auto-apply is feature-flagged by the GitHub variable `TERRAFORM_AUTO_APPLY`; production is currently configured with the flag enabled. Keep it enabled only while `CLOUDFLARE_API_TOKEN` has both Workers deploy permission and Cloudflare Zone DNS read/edit permission for `freddyfounders.com`.

The deploy job uses `wrangler.jsonc` as the deployment source of truth and publishes the built `dist/` artifact as a Cloudflare Worker with static assets.

Canonical production hostnames in `wrangler.jsonc`:

- `freddyfounders.com`
- `www.freddyfounders.com`

Before the first successful production deploy, Cloudflare must own the DNS zone:

1. In Cloudflare, add site `freddyfounders.com`.
2. At the domain registrar, replace the current nameservers with the two Cloudflare nameservers.
3. Wait until Cloudflare marks the zone active.
4. Create a Cloudflare API token using the **Edit Cloudflare Workers** template, scoped to this account/zone.
5. Run the bootstrap command below to store the token/account id in GitHub.

Because this Worker is the application origin, `wrangler.jsonc` uses Workers **Custom Domains** (`custom_domain: true`) rather than route patterns pointing at a separate origin.

Required GitHub Actions configuration:

- secret: `CLOUDFLARE_API_TOKEN`
- variable: `CLOUDFLARE_ACCOUNT_ID`

Recommended token permissions if creating a custom token manually:

- Account: `Workers Scripts:Edit`
- Zone: `Workers Routes:Edit` for `freddyfounders.com`
- Account: `Account Settings:Read`
- User: `User Details:Read`

Bootstrap those from local environment variables:

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... mise run bootstrap:github-cd
```

Local deployment uses the same code path:

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... mise run deploy
```

`mise run deploy` delegates to `pnpm run deploy`, which builds the app and runs `wrangler deploy`.

Secrets are intentionally not committed; the bootstrap script, Worker secret, and workflow are the code-owned automation boundary.

## Product boundaries

- Public pages: Login and Application/Register.
- Private app surfaces: Events, People, Companies, Admin.
- Events is the default private app surface after login.
- Anonymous visitors must not browse Events, People, or Companies.
- People/Companies are member-visible directories.
- Admin is maintenance-oriented and admin-only.
- No forum, resource library, social graph, messaging, voting, ranking, payment, or ticketing scope.

## Design Library

The canonical design library lives in `src/design/`.

Design source-of-truth flow:

```text
tokens/source/core.json
  -> Style Dictionary
  -> src/styles/generated/tokens.css
  -> src/design/design-system.css
  -> src/design/{primitives,composites,patterns}
  -> app pages
```

Design-library rules are documented in `src/design/README.md` and enforced by `pnpm design:check`.

Key contract:

- app pages import only from the public `src/design` API
- `ff-*` classes are private to `src/design`
- raw color values belong in token source, not app code
- every exported component must appear in `src/design/registry.ts`
- registry entries carry formal taxonomy category/status policy
- design components do not expose `className` or `style` escape hatches by default

Generated CSS variables are imported through `src/styles/tokens.css`.

## Requirements as Code

Executable product requirements live in `features/*.feature`.

They are intentionally product-facing and stable. They should not duplicate every low-level UI test.

## Git LFS

Large binary/design artifacts are tracked through `.gitattributes`:

- images
- PDFs
- archives
- Figma/Sketch/Adobe design source files
