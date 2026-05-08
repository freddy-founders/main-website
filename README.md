# Freddy Founders

Everything-as-Code scaffold for the Freddy Founders public network hub.

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

Copy `.env.example` to `.env` when real Supabase/Cloudflare values exist. Never commit service-role keys or provider tokens.

## Development

```bash
mise run dev
```

## Verification

```bash
mise run tokens:build
mise run test:unit
mise run bdd
mise run check
mise run build
mise run tf:init
mise run tf:validate
```

The pre-commit hook runs:

```text
formatting -> design tokens -> typecheck -> TDD unit tests -> BDD requirements
```

## Trunk CI/CD

The canonical trunk is `main`.

Automation lives in `.github/workflows/verify.yml` and is code-owned:

```text
pull_request -> CI gates only
push main    -> CI gates -> Terraform validation -> Cloudflare deploy
```

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

Secrets are intentionally not committed; the bootstrap script and workflow are the code-owned automation boundary.

## Product boundaries

- Public pages: Events, People, Companies, Login, Register.
- Events is the default front page.
- Public browsing must not require login.
- People/Companies are public-safe directories.
- Admin is maintenance-oriented.
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
