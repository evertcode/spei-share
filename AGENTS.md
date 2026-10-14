# AGENTS.md

Static Astro app to create and share Mexican SPEI transfer details (CLABE, card or account number, beneficiary and optional fields). There is no backend: shared data travels in the URL hash (`/ver#d=<base64url(JSON)>`) so it never reaches the hosting server.

## Stack

- Astro (static output) + TypeScript strict.
- Tailwind CSS v4 through `@tailwindcss/vite` (`src/styles/global.css`).
- Interactive islands in vanilla TypeScript (`<script>` inside `.astro` components). No UI framework.
- Vitest for unit tests, Playwright for end-to-end tests against `astro preview`. Playwright uses the installed Google Chrome (`channel: "chrome"`) because its bundled Chromium is not supported on macOS 12.
- ESLint (`typescript-eslint` strict + `eslint-plugin-astro`) and Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`).
- Package manager: `npm`.

## Commands

- `npm run dev`: start the dev server.
- `npm run verify`: typecheck, lint, format check, unit tests, build and e2e tests. Run it before every commit.
- `npm run format`: apply Prettier.

## Folder conventions

- `src/spei/domain/`: value objects, types and errors (one file per concept, `PascalCase.ts` for classes).
- `src/spei/application/`: use cases as plain functions (`camelCase.ts`).
- `src/components/`: Astro components (`PascalCase.astro`).
- `src/dom/`: small browser helpers for component scripts (e.g. `queryRequired` instead of non-null assertions).
- `src/layouts/`: page layouts.
- `src/pages/`: routes (`index.astro` form, `ver.astro` shared card).
- `src/i18n/es.ts`: every user facing copy (Spanish, Mexico). Never hardcode copies in components.
- `tests/unit/`: mirrors `src/` (`*.test.ts`).
- `tests/e2e/`: Playwright specs (`*.spec.ts`).

## Design conventions

- Editorial "paper and ink" identity. Use the semantic color tokens from `src/styles/global.css` (`paper`, `paper-raised`, `ink`, `ink-muted`, `rule`, `accent`, `accent-ink`, `danger`), never raw Tailwind palette colors.
- Dark mode only redefines the token CSS variables under `:root[data-theme="dark"]`. Use the `dark:` variant only for things tokens cannot express (e.g. swapping icons).
- Fonts: `font-display` (Newsreader) for headings, `font-sans` (Instrument Sans) for UI, `font-mono` (JetBrains Mono, tabular numbers) for CLABE, card and amounts. Use the `eyebrow` utility for small caps labels.
- Avoid the generic "AI look": no gradients, glassmorphism, purple/indigo, oversized rounded cards with soft shadows or emoji icons.
- Motion is subtle (`animate-fade-up`, short color transitions) and fully disabled under `prefers-reduced-motion`.

## Coding conventions

- Use custom types for all data structures.
- Value objects expose a `static create(value: string)` factory that normalizes and validates, throwing a dedicated error class with a typed `reason`.
- Code, tests and docs in English. UI copies in Spanish.
- Plans live in `.agents/plans/`.
