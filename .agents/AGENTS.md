# AGENTS.md - Agent Context for Comptasse

## Developer Commands

```bash
# Dev environment (requires Docker, just)
just dev up          # Start all services: website (5173), API (3000), DB, RustFS
just dev down       # Stop services
just dev reset     # Reset database

# CI build (used in PR checks)
just build         # Runs: lint → typecheck → test → build

# Per-package commands (pnpm filters)
pnpm --filter @comptasse/application-api exec tsc --noEmit         # TypeScript check API
pnpm --filter @comptasse/website exec tsc --noEmit  # TypeScript check website
pnpm --filter @comptasse/application-metadata exec tsc --noEmit    # TypeScript check metadata
pnpm check        # Biome lint + format check
pnpm check:fix  # Biome lint + format fix --write
pnpm build       # Build all packages
```

## Monorepo Structure

| Package | Role | Key Technologies |
|---------|------|-----------------|
| `packages/api` | Backend REST API | Hono, Drizzle ORM, PostgreSQL |
| `packages/website` | Frontend webapp | React, TanStack Router, Panda CSS |
| `packages/dashboard` | Authenticated dashboard SPA | React, TanStack Router, TanStack Query |
| `packages/metadata` | Shared schemas/types | Valibot, Drizzle ORM models |
| `packages/ui` | Shared UI components | React, Panda CSS |
| `packages/tools` | DB migrations/seeds | Drizzle, CLI |

**Entrypoints:**
- API: `packages/api/src/server.ts`
- Website: `packages/website/src/main.tsx`
- Dashboard: `packages/dashboard/src/main.tsx`

## Architecture Patterns

### Route definition → API → Frontend flow
1. Define schema + route in `packages/metadata/src/routes/`
2. Implement handler in `packages/api/src/routes/auth/` or `packages/api/src/routes/public/`
3. Consume via `useDataFromAPI` hook or `getResponseBodyFromAPI` in website or dashboard

### Agentic usage (external)
- Comptasse does not ship a built-in AI agent
- Users bring their own agent and interact with Comptasse via the REST API or CLI
- API authentication is cookie-based (signed session cookie obtained via `POST /auth/sign-in`); the organization is resolved from the URL path or the `X-Organization-Id` header
- `GET /routes` (public, no auth) returns a machine-readable catalog of every endpoint with its body/return fields
- Key agent-facing endpoints: `POST /organizations/:idOrganization/years/:idYear/scenarios/:scenario` (pre-built accounting entries, 22 scenarios), `POST .../entries/audit/missing-attachments`, `POST .../entries/audit/non-balanced`

## Documentation for External Agents (served as Markdown)

The website serves the full documentation as raw Markdown (append `.md` to any doc URL). Entry point for crawling:

- Sommaire: `/documentation/sommaire.md` — complete navigation of every page
- API reference: `/documentation/guide/référence-api.md` — conventions, error format, all 120 routes in 22 categories
- Agent quickstart: `/documentation/guide/agent/démarrer.md` — auth, conventions, scenarios, year-end workflow
- Scenarios catalog: `/documentation/comptabilité/ressources/scénarios.md` (index) and per-scenario pages `/documentation/comptabilité/ressources/scénarios/<slug>.md` (params, worked entries, execute snippet)
- Chart of accounts: `/documentation/comptabilité/ressources/comptes/<number>.md`, glossary: `/documentation/comptabilité/ressources/glossaire/<term>.md`

Year-end order: settle income statement (or `cloture-exercice` scenario) → opening entries in the new year (`ouverture-exercice` scenario or `POST /years/:idYear/open`) → result allocation (`affectation-resultat-benefice`) → close the year (`POST /years/:idYear/close` — the only operation that actually closes a year). Scenarios never close a year.

## Code Conventions

- **Indentation**: 4 spaces
- **Quotes**: double quotes
- **Trailing commas**: all
- **Import ordering**: alphabetical (Biome enforces this)
- **CSS**: Use `css()` from `@comptasse/ui/utilities/cn.js` with Panda CSS tokens
- **Validation**: Valibot schemas in `packages/metadata/src/schemas/`
- **Database**: Drizzle ORM in `packages/metadata/src/models/`

## Important Gotchas

- **Biome import sorting**: Run `pnpm check:fix` before committing - imports must be alphabetical
- **TypeScript**: After modifying metadata package, rebuild with `pnpm --filter @comptasse/application-metadata build` before API/website checks pass
- **Database**: Migrations live in `packages/tools/src/migrations/`, run via `pnpm --filter @comptasse/application-tools` commands

## References

- [Development guide](docs/DEVELOPMENT.md)
- [Architecture overview](docs/ARCHITECTURE.md)
- [Configuration](docs/CONFIGURATION.md)
- [Business model](docs/BUSINESS_MODEL.md)