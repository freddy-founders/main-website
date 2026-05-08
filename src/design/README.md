# Freddy Founders Design Library

This directory is the canonical, repo-enforced design library for Freddy Founders.

It turns the current mock language into maintained code:

```text
.agents/mocks + .agents/decisions
  -> tokens/source/core.json
  -> Style Dictionary
  -> src/styles/generated/tokens.css
  -> src/design/design-system.css
  -> src/design/components.tsx
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

## Ownership rules

1. Token values are owned in `tokens/source/core.json`.
2. Generated CSS variables are owned by Style Dictionary in `src/styles/generated/tokens.css`.
3. `ff-*` classes are private to this directory.
4. App pages must consume exported React primitives from `src/design`.
5. App pages must not write raw `ff-*` class names.
6. App pages must not import `design-system.css` directly.
7. New reusable UI must be added here first, then consumed by routes/features.
8. New primitives must be added to `designComponentRegistry`.
9. Any change to tokens/components must pass `pnpm design:check`.

## Public API

Exported from `src/design/index.ts`:

- `AppChrome`
- `Topbar`
- `PageShell`
- `Panel`
- `Rail`
- `RowList`
- `Row`
- `Meta`
- `Button`
- `ButtonLink`
- `Tag`
- `TagList`
- `FieldGrid`
- `Field`
- `TextInput`
- `TextArea`
- `Notice`
- `designComponentRegistry`
- `DesignLibraryExample`

## Enforcement

The repository enforces the design library through:

- `pnpm tokens:build` — generated tokens are rebuilt from source
- `pnpm design:check` — design contract lint
- `pnpm precommit` — runs format, tokens, design contract, typecheck, TDD, and BDD
- GitHub Actions trunk CI — runs the same design checks before deploy

## Adding a primitive

1. Add or reuse tokens in `tokens/source/core.json`.
2. Run `pnpm tokens:build`.
3. Add CSS in `src/design/design-system.css`.
4. Add the React primitive in `src/design/components.tsx`.
5. Add it to `src/design/registry.ts`.
6. Add a representative usage in `src/design/examples.tsx`.
7. Run `pnpm design:check && pnpm precommit`.
