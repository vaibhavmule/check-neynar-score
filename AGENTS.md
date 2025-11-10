# Repository Guidelines

## Project Structure & Module Organization
The Next.js 15 app keeps runtime code in `src`. App Router logic lives in `src/app` with layout, route handlers, and shared providers. Reusable components sit in `src/components` (UI primitives in `src/components/ui`), hooks in `src/hooks`, and services/utilities in `src/lib`. Static assets and favicons belong in `public`. CLI and deployment helpers (`scripts/dev.js`, `deploy.ts`, `cleanup.js`) are housed in `scripts`; prefer extending those scripts over adding ad-hoc shell steps.

## Build, Test, and Development Commands
- `npm run dev [-- --port 4000]`: starts the harness, loads `.env.local`, and opens a tunnel when `USE_TUNNEL=true`.
- `npm run cleanup [-- --port 4000]`: clears stuck processes on the dev port.
- `npm run lint`: runs `next lint`; resolve or track all warnings before review.
- `npm run build`: produces the production bundle and syncs env values; `npm run start` serves that build for smoke tests.
- `npm run deploy:vercel` (TypeScript wrapper) and `npm run deploy:raw` (Vercel CLI) push deployments—confirm required secrets first.

## Coding Style & Naming Conventions
Use TypeScript strict mode and the `~/*` alias. Declare React components in PascalCase, keep hooks in `useCamelCase`, and colocate helper logic in `src/lib`. Styling defaults to Tailwind utility classes; reserve global CSS tweaks for `src/app/globals.css`. Follow ESLint guidance, keep editor formatters on two-space indentation, and surface non-obvious logic with short comments.

## Testing Guidelines
No automated runner ships yet, so document manual QA with each change. Smoke test auth, Neynar score lookups, and Warpcast previews against `npm run dev` or the production build. When adding automated coverage, create `*.test.tsx` or `*.spec.ts` files in `src`, use React Testing Library for UI, and add a driver command (e.g., `npm test`) to `package.json`. Include API handler checks for `src/app/api` and pure function tests for `src/lib` helpers.

## Commit & Pull Request Guidelines
Write concise, imperative commit subjects (`Add score cache`, `Refine tunnel usage`) and keep related changes together. PRs should summarize intent, link issues or casts, call out env or script updates, attach UI screenshots when relevant, and record manual or automated test results.

## Environment & Deployment Tips
A seeded `.env.local` is tracked; treat it as the template and never commit production secrets. Update Neynar, Warpcast, and Upstash tokens before running dev or deploy scripts. The dev harness sets `NEXT_PUBLIC_URL` and `NEXTAUTH_URL`, so avoid overriding them. Share Vercel preview URLs in PRs to streamline Warpcast validation.

## References

- Neynar Score docs: https://docs.neynar.com/docs/neynar-user-quality-score
