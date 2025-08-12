# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router (routes, layouts, API under `app/api/*`, global styles in `app/globals.css`).
- `components/`: Reusable UI and feature components (e.g., `components/ui/*`).
- `lib/`: Server-side and shared logic (`lib/auth`, `lib/db`, `lib/validation`, `lib/config.ts`).
- `public/`: Static assets served at site root.
- `contexts/`, `hooks/`: React context and custom hooks.
- `docs/`: Project documentation; `scripts/`: operational scripts (env/migrations).
- Root: `middleware.ts`, `next.config.js`, `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server at `http://localhost:3000`.
- `npm run build`: Create production build.
- `npm start`: Serve the production build.
- Database: `npm run db:setup`, `db:migrate`, `db:seed`, `db:studio` (Drizzle + Postgres).
- Env/Prod checks: `npm run check:env`, `npm run production:check`.
- Deployment prep: `npm run deploy:prepare`.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` mode; App Router conventions (`page.tsx`, `layout.tsx`).
- Components: Export `PascalCase` React components; prefer function components and hooks.
- Files/dirs: kebab-case for filenames; keep route segments descriptive (e.g., `app/set-password`).
- Styling: Tailwind CSS (keep classes readable and grouped by purpose). No global CSS except `app/globals.css`.
- Imports: Use path alias `@/*` (see `tsconfig.json`).

## Testing Guidelines
- This repo has no formal test runner yet. Prioritize manual verification of auth, team flows, and email.
- Suggested structure if adding tests: `lib/**/__tests__/*` for unit tests; route-level tests near `app/**`.
- Aim for coverage of server actions, schema validation, and DB migrations.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (e.g., `feat(profile): add MBTI option`, `fix(teams): limit description length`).
- Branches: use short, descriptive names (e.g., `feature/explore-filters`, `fix/email-template`).
- PRs: include scope/summary, linked issues, screenshots for UI changes, and notes for DB changes (migrations, seed impacts).
- Pre-PR checklist: run `check:env`, `db:migrate`, and ensure `npm run build` succeeds.

## Security & Configuration Tips
- Secrets: keep `.env` local; never commit. Use `npm run check:env` to validate required vars.
- Database: apply migrations via `db:migrate`; inspect or tweak schema in `lib/db/*` and `drizzle` artifacts.
- Auth: cookies/JWT via middleware—avoid client-side secrets; mark client components with `'use client'` only when necessary.

