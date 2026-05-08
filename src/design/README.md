# Freddy Founders Design Library

This directory is the canonical, repo-enforced design library for Freddy Founders.

It turns the current mock language into maintained code:

```text
.agents/mocks + .agents/decisions
  -> tokens/source/core.json
  -> Style Dictionary
  -> src/styles/generated/tokens.css
  -> src/design/design-system.css
  -> src/design/{primitives,composites,patterns}
  -> app pages
```

## Design language

The current visual grammar is:

- YC/Bookface-style utility surfaces
- Swiss industrial/brutalist structure
- dense rows, strong hierarchy, low ornament
- square corners
- hard ink borders
- paper/shell backgrounds
- brick accent from the latest mock
- monospace uppercase metadata
- right-rail page context
- simple admin-maintenance grammar

## Taxonomy

```text
foundations -> primitives -> composites -> patterns -> routes/pages
```

- `foundations/` — internal helpers and strict prop types. Not a route/page API.
- `primitives/` — small reusable UI atoms: `Button`, `ButtonLink`, `Tag`, `Meta`, `Notice`, `TextInput`, `TextArea`.
- `composites/` — composed layout/content units: `AppChrome`, `Topbar`, `PageShell`, `Panel`, `Rail`, `RailSection`, `Row`, `RowList`, `TagList`, `Field`, `FieldGrid`.
- `patterns/` — larger reusable product/catalog shapes. Current pattern: `DesignLibraryExample`.

## Ownership rules

1. Token values are owned in `tokens/source/core.json`.
2. Generated CSS variables are owned by Style Dictionary in `src/styles/generated/tokens.css`.
3. `ff-*` classes are private to `src/design`.
4. App pages must import from the public `src/design` API only.
5. App pages must not import internal design subpaths like `src/design/primitives`.
6. App pages must not write raw `ff-*` class names.
7. App pages must not import `design-system.css` directly.
8. Design components must not expose `className` or `style` by default.
9. New reusable UI must be added in the right taxonomy folder first, then consumed by routes/features.
10. Every exported component must be added to `designComponentRegistry` with category/status policy.
11. Any change to tokens/components must pass `pnpm design:check`.

## Public API

Routes/pages import from `src/design/index.ts` only:

```ts
import { Button, Panel, Row } from './design';
```

Do not import from internal files:

```ts
import { Button } from './design/primitives';
```

## Enforcement

The repository enforces the design library through:

- `pnpm tokens:build` — generated tokens are rebuilt from source
- `pnpm design:check` — design contract lint
- `pnpm test:unit` — registry/API contract tests
- `pnpm precommit` — runs format, tokens, design contract, typecheck, TDD, and BDD
- GitHub Actions trunk CI — runs the same design checks before deploy

`pnpm design:check` fails if:

- app code references private `ff-*` classes
- app code imports internal design subpaths
- app code imports `design-system.css`
- raw hex colors appear outside token source/generated token output
- design components expose `className` or `style` props by default
- taxonomy/index/registry artifacts are missing
- exported taxonomy components are missing from the registry
- registry entries are stale, duplicated, or missing category/status policy

## Adding a component

1. Add or reuse tokens in `tokens/source/core.json`.
2. Run `pnpm tokens:build`.
3. Add CSS in `src/design/design-system.css` if needed.
4. Add the React component in the correct taxonomy folder.
5. Export it from that folder's `index.ts` and from `src/design/index.ts` through the taxonomy barrel.
6. Add it to `src/design/registry.ts` with `category`, `status`, `purpose`, and `allowedInRoutes`.
7. Add representative usage in `src/design/patterns/design-library-example.tsx` when helpful.
8. Run `pnpm design:check && pnpm precommit`.
