---
name: "Improve UI/UX"
description: "Accessibility fixes, a smoother creation form, a payer-focused shared page, and more robust sharing with link previews and print styles."
created_at: "2026-10-15T00:10:59Z"

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

last_implementation_at: "2026-10-15T00:33:52Z"
has_completed_all_phases: "false"
---

# 🎯 Goal

Polish SPEI Share based on a UX and accessibility audit: meet WCAG AA contrast and forced-colors support, make the creation form validate and guide as you type, make `/ver` obvious for the person who pays, and make sharing robust with announced feedback, sensible link previews and print styles.

# 👀 Context

- [`AGENTS.md`](../../../AGENTS.md): stack, folder conventions, design conventions (semantic color tokens, fonts, motion, anti "AI look"), copies only in [`src/i18n/es.ts`](../../../src/i18n/es.ts), verification command `npm run verify`.
- Audit findings (Phase grouping follows them):
  - Accessibility: placeholder contrast 1.87:1 (light) / 2.31:1 (dark) in [`TextField.astro`](../../../src/components/TextField.astro); field underline (`border-rule`, 1.33:1) and segmented control borders (`ink/15`, 1.35:1) below 3:1; no `forced-colors` support (checked segment, field focus and filled buttons disappear); `focus:outline-none` on `#generatedLink`; faint link underlines (`decoration-accent/40`); copy buttons about 28px tall, theme toggle 36px, clear draft button about 24px; CLABE `whitespace-nowrap` overflows at 200% zoom; no skip link; CLABE hint `aria-live` fires on every keystroke; draft notice not announced.
  - Form ([`TransferForm.astro`](../../../src/components/TransferForm.astro)): validation only on submit, stale errors, no focus on first invalid field, generated link revealed silently and below the fold, generated link stays visible after edits, no formatting/maxlength/counter/uppercase, draft saved only on success, reset drops focus.
  - Shared page ([`TransferCard.astro`](../../../src/components/TransferCard.astro), [`ver.astro`](../../../src/pages/ver.astro)): no primary action, no instructions, destination is the third row, amount not prominent, invalid message not actionable, unexpected errors leave a blank page, no `<noscript>`.
  - Sharing and meta ([`CopyButton.astro`](../../../src/components/CopyButton.astro), [`ShareActions.astro`](../../../src/components/ShareActions.astro), [`shareTransfer.ts`](../../../src/spei/application/shareTransfer.ts), [`BaseLayout.astro`](../../../src/layouts/BaseLayout.astro)): unhandled clipboard failures, copy feedback not announced, overlapping feedback timers, "Compartir" shown when unsupported, duplicated share text formatting, QR without caption and with a fixed filename, creator-oriented meta description on `/ver`, no Open Graph tags, `/ver` indexable, no print styles.
- Contracts to preserve (page scripts use `queryRequired`): element ids (`#transfer-form`, field ids and `#<field>-error`, `#clabe-hint`, `#draft-notice`, `#clear-draft`, `#generated-link`, `#generatedLink`, `#copy-generated-link`, `#transfer-card`, `#invalid-link`, `#share-actions`, `#copy-all`, `#copy-link`, `#native-share`, `#share-status`, `#share-qr`, `#share-qr-download`, `#theme-toggle`), `[data-row]`, `[data-value]`, `[data-copy-button]`, `[data-show-for]`, `input[name="destinationType"]`, and the accessible names used by [`tests/e2e/`](../../../tests/e2e/) (any rename updates the specs in the same phase).
- No new dependencies: accessibility is covered by targeted Playwright tests instead of an automated scanner.

# 🪜 Phases

## Phase 1: Accessibility baseline

Fix contrast, forced colors, focus, touch targets and zoom so every later phase builds on an accessible base.

### Public contracts

- Styles (`src/styles/global.css`):
  - `@media (forced-colors: active)` block: visible `CanvasText` outline on focused inputs. The checked segment indicator (underline + bold) uses `forced-colors:has-checked:` variants in `TransferForm.astro`, and filled buttons (submit, native share) get `border border-transparent` so forced colors draws their boundary.
- Components:
  - `TextField.astro`: placeholder uses `text-ink-muted`; default underline uses `border-ink-muted`; CLABE hint no longer `aria-live` (still linked through `aria-describedby`).
  - `TransferForm.astro`: segmented control borders and dividers use `ink-muted`; segment labels `min-h-11`; `#generatedLink` keeps a visible focus indicator; `#draft-notice` gets `role="status"`; `#clear-draft` gets padding for a 44px target.
  - `CopyButton.astro`, `ThemeToggle.astro`, `#native-share`: minimum 44px touch targets (`min-h-11`, toggle `size-11`).
  - `ShareActions.astro`, `TransferCard.astro`: link underlines use `decoration-accent`.
  - `TransferCard.astro`: destination value drops `whitespace-nowrap` and only wraps between digit groups.
  - `BaseLayout.astro`: visually hidden skip link as first focusable element, `<main id="main" tabindex="-1">` so the skip link moves focus into it.
  - `TextField.astro` hover underline darkens to `ink`.
- UI copies:
  - `a11y.skipToContent`: "Saltar al contenido"
- Test suites:
  - `tests/e2e/accessibility.spec.ts`
    - `skip link moves focus to the main content`
    - `placeholders meet 4.5:1 contrast in light and dark themes`
    - `interactive controls are at least 44px tall`
    - `keeps a visible indicator on the selected destination in forced colors mode`

### To-do

- [x] Fix placeholder, underline, segmented control and link underline contrast with existing tokens.
- [x] Add the forced-colors block and restore the focus indicator on `#generatedLink`.
- [x] Raise touch targets to 44px on copy buttons, theme toggle, native share, segments and clear draft.
- [x] Let the destination value wrap between groups at high zoom.
- [x] Add the skip link, `id="main"`, `role="status"` on the draft notice and remove `aria-live` from the CLABE hint.
- [x] Add the `a11y.skipToContent` copy and `tests/e2e/accessibility.spec.ts`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 2: Guided creation form

Validate and format as the user goes, keep the generated link in sync with the form and autosave drafts.

### Public contracts

- Application:
  - `src/spei/application/validateTransferForm.ts`:
    - `type TransferFormField = "beneficiaryName" | DestinationType | "bankName" | OptionalField`
    - `type TransferFormValues = { destinationType: DestinationType } & Record<TransferFormField, string>`
    - `type TransferFormResult = { ok: true; data: SpeiTransferData } | { ok: false; errors: Partial<Record<TransferFormField, string>> }`
    - `validateTransferForm(values: TransferFormValues): TransferFormResult` (logic moved out of `TransferForm.astro`, messages from `es`).
    - `validateTransferField(field: TransferFormField, values: TransferFormValues): string | undefined`
    - `formatTransferField(field: TransferFormField, value: string): string`: display formatting on blur (CLABE groups, card groups of 4, amount `1,500.00`, RFC uppercase), returns the input unchanged when invalid.
    - Also exported: `TRANSFER_FORM_FIELDS`, `TransferFormErrors`, `emptyTransferFormValues()` and `isActiveField(field, values)` (hidden destination fields and `bankName` for CLABE are ignored by validation).
  - `src/spei/application/draftStorage.ts` (replaces the current functions):
    - `saveFormDraft(values: TransferFormValues, storage?): void`, `loadFormDraft(storage?): TransferFormValues | null`, `clearFormDraft(storage?): void`.
    - Key `spei-share:draft:v2` (raw values, saved on input, debounced). Drafts under `v1` are ignored.
- Domain: `listBanks(): readonly Bank[]` in `banks.ts`.
- Components:
  - `TextField.astro`: new props `maxlength`, `autocapitalize`, `spellcheck`, `enterkeyhint` (default `next`), `counter` (renders `n/max` linked through `aria-describedby`), `list` (datalist id) and `uppercase`.
  - `TransferForm.astro`:
    - Validates a field on blur and clears its error on input once valid; on invalid submit focuses the first invalid field.
    - Formats CLABE, card, amount and RFC on blur; `maxlength` on CLABE (22), card (19), account (11), concept (40, with counter), RFC (13); RFC shown uppercase.
    - Bank field for card and account suggests banks through a `<datalist>`.
    - On success focuses `#generatedLink`, scrolls it into view and announces the ready status through a visually hidden `#form-status` (`role="status"`).
    - Stale notice is `#generated-link-stale` (`role="status"`), rendered after the form.
    - Draft restore formats values with `formatTransferField` and is skipped when every field is empty.
    - Editing any field after generating hides the link and share actions and shows the stale notice.
    - Draft autosaves on input; "Empezar de nuevo" clears form and draft and focuses the first field.
- UI copies:
  - `form.generatedLink.ready`: "Enlace generado"
  - `form.generatedLink.stale`: "Cambiaste datos, vuelve a generar el enlace"
  - `form.draft.clear`: "Empezar de nuevo" (was "Borrar datos guardados")
- Test suites:
  - `tests/unit/spei/application/validateTransferForm.test.ts`
    - `returns transfer data for a valid clabe form`
    - `requires the bank name for card and account destinations`
    - `returns an error per invalid field`
    - `ignores empty optional fields`
    - `validates a single field`
    - `formats clabe, card, amount and rfc for display`
  - `tests/unit/spei/application/draftStorage.test.ts` (rewritten)
    - `saves and loads raw form values`
    - `returns null when there is no draft`
    - `returns null when the draft is corrupted`
    - `returns null when the draft has an unknown destination type`
    - `returns null when storage throws`
    - `clears the draft`
  - `tests/unit/spei/domain/banks.test.ts` (modified)
    - `lists every bank in the catalog`
  - E2E specs locate the bank field with `getByLabel("Banco", { exact: true })`: with the `<datalist>` its role is `combobox`, no longer `textbox`.
  - `tests/e2e/draft.spec.ts` (modified)
    - `prefills the form after reloading` (no link generation needed)
    - `starts over clearing the form and the draft`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `validates a field when leaving it`
    - `focuses the first invalid field on submit`
    - `hides the generated link when the form changes`
    - `formats the clabe when leaving the field`

### To-do

- [x] Extract `validateTransferForm`, `validateTransferField` and `formatTransferField` with unit tests.
- [x] Replace draft storage with raw form value drafts (`v2`) and update its unit tests.
- [x] Add `listBanks` and the new `TextField` props.
- [x] Wire blur validation, error clearing, focus on first invalid field, blur formatting, counters, datalist and uppercase RFC in `TransferForm.astro`.
- [x] Focus, scroll and announce the generated link; hide it with the stale notice when the form changes.
- [x] Autosave drafts on input, rename the reset action and move focus after reset.
- [x] Update `draft.spec.ts` and `share-flow.spec.ts`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 3: Payer-focused shared page

Make `/ver` tell the payer what to do and put the destination first.

### Public contracts

- Components:
  - `CopyButton.astro`: new prop `variant: "quiet" | "primary"` (default `quiet`); `primary` is a filled ink button. Accessible names unchanged.
  - `TransferCard.astro`:
    - Row order: destination (headline, `primary` copy button), amount (headline when present), beneficiary, bank, concept, RFC, email.
    - Instructions line above the rows.
    - Any decoding or rendering error shows the invalid state (no blank page).
    - Invalid state adds a help line for the payer; valid state adds a quiet "create your own link" prompt below the receipt.
  - `ver.astro`: `<noscript>` message.
- UI copies:
  - `view.instructions`: "Copia los datos y transfiere desde la app de tu banco."
  - `view.invalidLinkHelp`: "Pide a quien te lo envió que comparta el enlace completo de nuevo."
  - `view.createOwnPrompt`: "¿También recibes transferencias?"
  - `view.noscript`: "Activa JavaScript para ver los datos de este enlace."
- Test suites:
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `shows the destination as the first row with a primary copy button`
    - `shows instructions for the payer`
    - `shows help for the payer when the link is invalid`
  - `tests/e2e/noscript.spec.ts`
    - `explains that javascript is required`

### To-do

- [ ] Add the `variant` prop to `CopyButton.astro`.
- [ ] Reorder rows, highlight destination and amount and add instructions in `TransferCard.astro`.
- [ ] Catch every error into the invalid state and add the payer help line and the create-your-own prompt.
- [ ] Add the `<noscript>` message and copies.
- [ ] Add and update e2e tests.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 4: Robust sharing, link previews and print

Announce copy results, handle failures, hide unsupported actions and make links preview and print well.

### Public contracts

- DOM helpers: `src/dom/announce.ts` with `announce(message: string): void` writing into a visually hidden `#announcer` (`role="status"`) rendered by `BaseLayout.astro`.
- Application:
  - `formatShareText(data: SpeiTransferData, url: URL): string` in `formatTransferText.ts`, used by "Copiar todo" and by the `shareTransfer` fallback.
  - `qrFileName(destination: TransferDestination): string`: `spei-<last 4 digits>.svg`.
- Components:
  - `CopyButton.astro`: try/catch around the clipboard call, announces success or failure, clears the previous feedback timer.
  - `ShareActions.astro`: `#native-share` hidden when `navigator.share` is unavailable; non-abort share errors show a message; QR caption; download filename from `qrFileName`.
  - `BaseLayout.astro`: props `description?: string` and `noindex?: boolean`; Open Graph (`og:title`, `og:description`, `og:type`, `og:locale`) and `twitter:card` tags; `#announcer`.
  - `ver.astro`: payer-oriented description and `noindex`.
- Styles: `@media print` hides header, footer, copy buttons and share actions and removes the receipt shadow.
- UI copies:
  - `copy.doneFor`: "{label} copiado"
  - `copy.failed`: "No se pudo copiar, selecciona el texto manualmente"
  - `share.failed`: "No se pudo compartir, intenta copiar los datos"
  - `share.qr.caption`: "Muéstralo a quien te va a transferir."
  - `meta.home.description`: same text as `home.subheading`
  - `meta.view.description`: "Te compartieron datos para una transferencia SPEI."
- Test suites:
  - `tests/unit/spei/application/formatTransferText.test.ts` (modified)
    - `appends the link after the transfer text`
  - `tests/unit/spei/application/qrFileName.test.ts`
    - `uses the last four digits of the destination`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `shows a message when the clipboard fails`
    - `hides the native share button when it is not supported`
    - `shows the qr caption and a destination based filename`
  - `tests/e2e/meta.spec.ts`
    - `marks the shared page as noindex`
    - `uses a payer oriented description on the shared page`

### To-do

- [ ] Add `#announcer` and `announce`, and make `CopyButton.astro` robust and announced.
- [ ] Add `formatShareText` and use it in "Copiar todo" and `shareTransfer`.
- [ ] Hide unsupported native share and handle share errors.
- [ ] Add the QR caption and `qrFileName`.
- [ ] Add `description`, `noindex`, Open Graph and Twitter tags to `BaseLayout.astro` and use them in both pages.
- [ ] Add print styles.
- [ ] Add and update unit and e2e tests.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

# ⏭️ Next step

Implement Phase 3: payer-focused shared page.

Ramps in place, the turtle now walks every visitor through the form step by step thanks to [Codely](https://codely.com) 🐢 💨 🔍 ♿ 🧭
