# Architecture guidance for AI agents

Use the `frontend` skill (`.opencode/skills/frontend`) for any React/Next implementation, refactor, or review. No backend lives in this repo, so `backend` and `monorepo` do not apply. If the skill is unavailable, report that and use the constraints below.

## Framework deviation: Next.js App Router

Arctis requires `src/pages/`, `src/feat/`, `src/shared/` under `src/`. This app is Next.js App Router, so routing must stay in `src/app/` (`layout.tsx`, `page.tsx`, `robots.ts`, `sitemap.ts`).

- `src/app/` is the routing layer only: route files, metadata, and thin page composition. No reusable components, hooks, or business logic.
- Treat `src/app/**/page.tsx` as the Arctis page layer. Keep pages thin; move complex state and behavior into the owning feature.
- Never create `src/pages/`: Next treats it as the Pages Router and conflicts with `src/app/`.
- The bundled validator therefore reports `src/app INVALID_ROOT` and `src/pages MISSING_ROOT`. That is the accepted deviation; every other check must pass.

## Non-negotiable frontend constraints

- Only `src/feat/` and `src/shared/` may be architectural roots beside `src/app/`. Do not add `src/components/`, `src/hooks/`, `src/utils/`, or `src/services/`.
- Each `src/feat/<name>/` is isolated: it may import itself and `shared/`, never another feature.
- `shared/` may import `shared/` and external packages, never `feat/` or `app/`.
- No circular dependencies. Aliases, barrels, type-only imports, and dynamic imports do not bypass boundaries.
- Keep `*.test.*` and `*.spec.*` out of `src/`; tests belong in `tests/`.
- Do not silently disable or weaken architecture checks.

## Validation before completion

```sh
npx tsc --noEmit
npm run lint
npm run build
node .opencode/skills/frontend/scripts/validate-architecture.mjs .
```

Report commands run, unresolved violations, and limits. Never claim an unrun check passed.
