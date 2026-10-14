---
name: "Redesign editorial receipt UI"
description: "Replace the default Tailwind look with a warm editorial identity: paper and ink palette, Newsreader + Instrument Sans + JetBrains Mono, document-like form, receipt-style shared card, subtle motion and a system-aware dark mode with manual toggle."
created_at: "2026-10-14T22:51:45Z"

created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

implemented_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

last_implementation_at: "2026-10-14T22:57:04Z"
has_completed_all_phases: "false"
---

# 🎯 Goal

Give SPEI Share an elegant, modern and distinctive look that does not read as AI generated: a warm editorial style (paper, ink, serif headlines, monospaced figures) where the shared page looks like a printed transfer receipt. Add subtle motion and a dark mode that follows the system with a manual toggle. Behavior, copies and accessibility contracts stay the same.

# 👀 Context

- [`AGENTS.md`](../../../AGENTS.md): stack (Astro 7 static, Tailwind v4 via `@tailwindcss/vite`, vanilla TS islands), folder conventions, copies only in `src/i18n/es.ts`, verification command `npm run verify`.
- Current UI (default Tailwind slate/teal palette, system fonts, no theme tokens, no dark mode, no transitions):
  - [`src/styles/global.css`](../../../src/styles/global.css): only `@import "tailwindcss";`.
  - [`src/layouts/BaseLayout.astro`](../../../src/layouts/BaseLayout.astro): body `bg-slate-50 text-slate-900`, `main.max-w-xl`.
  - [`src/pages/index.astro`](../../../src/pages/index.astro), [`src/pages/ver.astro`](../../../src/pages/ver.astro).
  - [`src/components/TextField.astro`](../../../src/components/TextField.astro), [`CopyButton.astro`](../../../src/components/CopyButton.astro), [`TransferForm.astro`](../../../src/components/TransferForm.astro), [`TransferCard.astro`](../../../src/components/TransferCard.astro), [`ShareActions.astro`](../../../src/components/ShareActions.astro).
  - [`public/favicon.svg`](../../../public/favicon.svg): teal square with "$".
- Contracts that must be preserved (page scripts use `queryRequired`, which throws when an element is missing):
  - ids: `#transfer-form`, `#draft-notice`, `#clear-draft`, `#generated-link`, `#generatedLink`, `#copy-generated-link`, every field id (`beneficiaryName`, `clabe`, `card`, `account`, `bankName`, `concept`, `amount`, `rfc`, `email`) and its `#<field>-error`, `#clabe-hint`, `#transfer-card`, `#invalid-link`, `#share-actions`, `#share-heading`, `#copy-all`, `#copy-link`, `#native-share`, `#share-status`, `#share-qr`, `#share-qr-download`.
  - Attributes: `input[name="destinationType"]` radios, `[data-show-for]`, `[data-row]`, `[data-value]`, `dt` inside rows, `[data-copy-button]`, `data-copy-value`, `data-idle-text`, and `hidden` toggling (relies on Tailwind preflight `[hidden]{display:none !important}`).
  - Accessible names used by e2e tests in [`tests/e2e/`](../../../tests/e2e/): field labels, radio names, "Generar enlace", "Copiar <label>", "Copiar todo", "Descargar QR", QR `role="img"` name, `role="alert"` for the invalid link, h1 texts "Comparte tus datos SPEI" and "Datos para transferencia".
- Design decisions agreed with the user:
  - Direction: warm editorial. Paper `#F4EFE6`, ink `#1C1A17`, muted `#6B645A`, rule `#D9D0C1`, accent "verde billete" `#2F5D50`, danger terracotta `#A23B2A`. Dark: night ink `#16140F` background, paper text `#EDE6D8`, lighter accent.
  - Typography: Newsreader (display serif), Instrument Sans (UI), JetBrains Mono (CLABE, card, amounts). Self-hosted with `@fontsource-variable/*` packages, no third-party font CDN.
  - Shared page `/ver`: receipt/ticket with zig-zag edges, dotted separators, monospaced figures and QR at the bottom.
  - Motion: subtle, always disabled under `prefers-reduced-motion: reduce`.
  - Dark mode: follows `prefers-color-scheme`, manual toggle persisted in `localStorage`.
- Anti "AI look" guidelines for every phase: no gradients, no glassmorphism, no purple/indigo, no oversized rounded cards with soft drop shadows, no emoji icons. Prefer hairline rules, typographic hierarchy, generous whitespace and a single accent color.
- Color tokens are CSS variables exposed through Tailwind v4 `@theme` (e.g. `bg-paper`, `text-ink`, `border-rule`, `text-accent`), so dark mode only redefines variables instead of adding `dark:` variants everywhere.

# 🪜 Phases

## Phase 1: Design foundation and home hero

Introduce tokens, fonts and the page shell so the home page already shows the new identity.

### Public contracts

- Styles (`src/styles/global.css`):
  - `@theme` color tokens: `paper`, `paper-raised`, `ink`, `ink-muted`, `rule`, `accent`, `accent-ink`, `danger` backed by CSS variables on `:root`.
  - Font tokens: `--font-display` (Newsreader Variable), `--font-sans` (Instrument Sans Variable), `--font-mono` (JetBrains Mono Variable).
  - Base styles: body background/text from tokens, `font-feature-settings` for tabular numbers on mono, selection color, focus ring style using `accent`.
  - `eyebrow` utility (`@utility`) for small caps labels.
  - Semantic color tokens use `@theme inline` so redefining the CSS variables (Phase 5) switches every utility.
- Components:
  - `SiteHeader.astro`: wordmark linking to `/` (visual parts `aria-hidden`, link named by `brand.wordmark`).
  - `SiteFooter.astro`: privacy note.
  - `BaseLayout.astro`: imports fonts, renders header, `<main>`, footer.
- Pages: `index.astro` hero with eyebrow, h1 in display serif (text unchanged, last word `home.headingEmphasis` in accent italic) and subheading.
- Assets: `public/favicon.svg` redesigned (ink "S" mark on paper with accent rule).
- UI copies:
  - `brand.wordmark`: "SPEI · share"
  - `home.eyebrow`: "Transferencias SPEI"
  - `home.headingEmphasis`: "SPEI"
  - `footer.privacy`: "Tus datos viajan dentro del enlace, nunca en un servidor."

### To-do

- [x] Add `@fontsource-variable/newsreader`, `@fontsource-variable/instrument-sans` and `@fontsource-variable/jetbrains-mono` dependencies.
- [x] Define color and font tokens plus base styles in `src/styles/global.css`.
- [x] Create `SiteHeader.astro` and `SiteFooter.astro`, wire them and the fonts into `BaseLayout.astro`.
- [x] Restyle the hero in `index.astro` and the heading in `ver.astro` with display serif and eyebrow.
- [x] Redesign `public/favicon.svg`.
- [x] Add new copies to `src/i18n/es.ts`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 2: Document-like form

Restyle the creation form so it feels like filling in a document.

### Public contracts

- Components:
  - `TextField.astro`: small-caps label, underline input (bottom rule that turns `accent` on focus and `danger` when `aria-invalid`), hint and error lines with tokens. Same props and ids.
  - `TransferForm.astro`:
    - Destination type as a segmented control (radios visually hidden but accessible, `has-checked` styles).
    - Optional fields grouped under a hairline-ruled section with the existing legend.
    - Draft notice as a slim ruled banner.
    - Primary submit button in ink with arrow glyph (accessible name stays "Generar enlace").
    - Generated link shown as a monospaced "stub" with its copy button.
  - `CopyButton.astro`: quiet text button style with tokens (same contract).
- No copy changes.

### To-do

- [ ] Restyle `TextField.astro` with underline inputs and token colors.
- [ ] Restyle the destination selector as a segmented control keeping the radio inputs and names.
- [ ] Restyle optional section, draft notice, submit button and generated link in `TransferForm.astro`.
- [ ] Restyle `CopyButton.astro`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 3: Shared page as a transfer receipt

Turn `/ver` into a printed receipt.

### Public contracts

- Components:
  - `TransferCard.astro`:
    - Receipt container on `paper-raised` with zig-zag top and bottom edges (CSS `mask`/`clip-path`, no images).
    - Eyebrow and verify note inside the receipt.
    - Rows separated by dotted rules, labels in small caps, values right-aligned with monospaced figures for destination and amount.
    - Same `#transfer-card`, `[data-row]`, `[data-value]`, `dt`, `[data-copy-button]` contracts.
    - Invalid link state restyled as an editorial notice keeping `role="alert"` and the link to `/`.
- UI copies:
  - `view.receipt.eyebrow`: "Comprobante para transferir"
  - `view.receipt.verify`: "Verifica el nombre del beneficiario antes de enviar."

### To-do

- [ ] Build the receipt layout and zig-zag edges in `TransferCard.astro`.
- [ ] Restyle rows, labels, values and per-row copy buttons.
- [ ] Add eyebrow and verify note copies and render them.
- [ ] Restyle the invalid link state.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 4: Share actions, QR stub and subtle motion

Integrate sharing into the receipt aesthetic and add restrained motion.

### Public contracts

- Components:
  - `ShareActions.astro`:
    - Actions as a ruled row of quiet buttons with "Compartir" as the primary ink button.
    - QR shown as a tear-off stub (dashed perforation line above), QR drawn in `ink` on `paper-raised`.
    - "Descargar QR" as a text link.
    - Same ids, roles and names.
  - `CopyButton.astro`: copied feedback with a short color/check transition.
- Styles (`src/styles/global.css`):
  - Utility keyframes `fade-up` (opacity + 4px translate, 180ms) applied when `#generated-link`, `#share-actions` and `#transfer-card` become visible.
  - Transitions on hover/focus for buttons, inputs and segmented control.
  - `@media (prefers-reduced-motion: reduce)` disables all animations and transitions.
- Test suites:
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `does not animate when reduced motion is requested`

### To-do

- [ ] Restyle `ShareActions.astro` with the QR stub and action row.
- [ ] Add copied feedback transition to `CopyButton.astro`.
- [ ] Add `fade-up` keyframes, transitions and reduced motion overrides in `global.css`, apply them to the revealed sections.
- [ ] Add the reduced motion e2e test (emulate `reducedMotion: "reduce"` and assert computed `animation-name` is `none` on `#share-actions`).
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 5: Dark mode with system default and manual toggle

Add dark theme values and a persisted toggle without flash of the wrong theme.

### Public contracts

- DOM helpers (`src/dom/theme.ts`):
  - `type Theme = 'light' | 'dark'`
  - `THEME_STORAGE_KEY = 'spei-share:theme'`
  - `resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme`
  - `loadThemePreference(storage?: Pick<Storage, 'getItem'>): string | null`: returns `null` when storage throws.
  - `saveThemePreference(theme: Theme, storage?: Pick<Storage, 'setItem'>): void`: never throws.
  - `applyTheme(theme: Theme, root?: HTMLElement): void`: sets `data-theme` and `color-scheme` on `<html>`.
- Styles: dark values for every color token under `:root[data-theme="dark"]`, QR keeps ink on light paper for scanner contrast.
- Components:
  - `ThemeToggle.astro` in `SiteHeader.astro`: icon button (inline SVG sun/moon) whose `aria-label` says the action.
  - `BaseLayout.astro`: `is:inline` script in `<head>` applying the stored or system theme before first paint.
- UI copies:
  - `theme.toDark`: "Cambiar a tema oscuro"
  - `theme.toLight`: "Cambiar a tema claro"
- Test suites:
  - `tests/unit/dom/theme.test.ts`
    - `uses the stored theme when valid`
    - `follows the system preference when nothing is stored`
    - `ignores invalid stored values`
    - `saves and loads the theme preference`
    - `does not throw when storage is not accessible`
  - `tests/e2e/theme.spec.ts`
    - `follows the system dark preference`
    - `toggles the theme with the header button`
    - `remembers the chosen theme after reloading`

### To-do

- [ ] Create `src/dom/theme.ts` with unit tests.
- [ ] Add dark token values in `global.css`.
- [ ] Add the inline theme bootstrap script to `BaseLayout.astro`.
- [ ] Create `ThemeToggle.astro`, mount it in `SiteHeader.astro`, add copies.
- [ ] Add `tests/e2e/theme.spec.ts`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

# ⏭️ Next step

Implement Phase 2: document-like form with underline fields, segmented destination control and ink submit button.

The turtle picked its paper and ink, and the first page is already printed thanks to [Codely](https://codely.com) 🐢 💨 🖋️ 📜
