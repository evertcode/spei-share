---
name: "Create SPEI share Astro app"
description: "Static Astro app to create, validate and share Mexican SPEI transfer details (CLABE, card or account) through a URL-hash link, QR code, clipboard and Web Share API."
created_at: "2026-10-14T20:58:39Z"

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

last_implementation_at: "2026-10-14T22:09:45Z"
has_completed_all_phases: "false"
---

# 🎯 Goal

Build a static Astro application where a user fills in their SPEI transfer details (CLABE with auto-detected bank, card or account number, beneficiary name and optional concept, amount, RFC and email) and shares them through a link, QR code, clipboard or the native share sheet. No backend: data travels in the URL hash, so it never reaches the hosting server.

# 👀 Context

- The repository at [`./`](../../../) is empty: no code, no `package.json`, no git repository, no `AGENTS.md`. Every convention is defined by this plan.
- Stack decisions agreed with the user:
  - Astro (static output) + TypeScript strict.
  - Tailwind CSS for styles.
  - Interactive islands written in vanilla TypeScript (`<script>` in `.astro` components), no UI framework.
  - Vitest for unit tests, Playwright for end-to-end tests.
  - ESLint (`eslint-plugin-astro`) + Prettier (`prettier-plugin-astro`).
  - `npm` as package manager.
- Data sharing: `/ver#d=<base64url(JSON)>`. The hash is never sent to the server.
- Last entered data is remembered in `localStorage` (browser only).
- UI copies are in Spanish (Mexico).
- Folder conventions to establish:
  - `src/spei/domain/`: value objects, types and errors (`Clabe`, `CardNumber`, `AccountNumber`, `Rfc`, `Amount`, `Concept`, `Email`, `SpeiTransferData`, bank catalog).
  - `src/spei/application/`: use cases (`encodeShareLink`, `decodeShareLink`, `formatTransferText`, `generateQrSvg`, `shareTransfer`, draft storage).
  - `src/components/`: Astro components (`TransferForm.astro`, `TransferCard.astro`, `CopyButton.astro`, `ShareActions.astro`).
  - `src/pages/`: `index.astro` (form) and `ver.astro` (shared card).
  - `src/i18n/es.ts`: all user facing copies.
  - `tests/unit/` mirrors `src/`. `tests/e2e/` holds Playwright specs.
- Verification command (defined in Phase 1): `npm run verify` = `astro check && eslint . && prettier --check . && vitest run && playwright test`.

# 🪜 Phases

## Phase 1: Project scaffold with a navigable home page

Set up the tooling and deliver a home page that can be opened in the browser. No business logic.

### Public contracts

- Pages: `src/pages/index.astro` with a base layout `src/layouts/BaseLayout.astro`.
- UI copies (`src/i18n/es.ts`):
  - `app.title`: "SPEI Share"
  - `home.heading`: "Comparte tus datos SPEI"
  - `home.subheading`: "Crea un enlace para que te transfieran sin errores. Tus datos no se guardan en ningún servidor."
- Test suites:
  - `tests/e2e/home.spec.ts`
    - `shows the home heading`

### To-do

- [x] Initialize git repository and `.gitignore` (node_modules, dist, .astro, test reports).
- [x] Scaffold Astro with TypeScript strict (`astro.config.mjs`, `tsconfig.json` extending `astro/tsconfigs/strict`), static output.
- [x] Add Tailwind CSS integration and a global stylesheet.
- [x] Add ESLint (`eslint-plugin-astro`, `typescript-eslint`) and Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`).
- [x] Add Vitest (`vitest.config.ts` using `getViteConfig` from Astro) and Playwright (`playwright.config.ts` running against `astro preview`).
- [x] Add npm scripts: `dev`, `build`, `preview`, `check`, `lint`, `format`, `test`, `test:e2e`, `verify`.
- [x] Create `BaseLayout.astro` (lang `es-MX`, meta viewport, title) and `index.astro` with heading and subheading from `src/i18n/es.ts`.
- [x] Create `AGENTS.md` documenting stack, folder conventions and the `npm run verify` command.
- [x] Add `tests/e2e/home.spec.ts`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 2: Happy path: create link from CLABE and beneficiary name, view it with per-field copy

Fill CLABE and beneficiary name, generate a share link, open it and copy each field. Only minimal validation (18 digits, non-empty name); check digit and bank come in Phase 3.

### Public contracts

- Domain (`src/spei/domain/`):
  - `type TransferDestination = { type: 'clabe'; value: string }` (extended in Phase 4).
  - `type SpeiTransferData = { beneficiaryName: string; destination: TransferDestination }` (extended in Phases 3 and 5).
  - `class Clabe { static create(value: string): Clabe; readonly value: string; formatted(): string }`: normalizes spaces and dashes, requires 18 digits, throws `InvalidClabeError`. `formatted()` groups as `XXX XXX XXXXXXXXXXX X`.
  - `class InvalidClabeError extends Error { readonly reason: 'length' | 'non_numeric' }`.
- Application (`src/spei/application/`):
  - `encodeShareLink(data: SpeiTransferData, baseUrl: URL): URL`: returns `{baseUrl}/ver#d=<base64url(JSON)>`, UTF-8 safe.
  - `decodeShareLink(hash: string): SpeiTransferData`: throws `InvalidShareLinkError` on malformed hash, invalid JSON or invalid data.
  - `class InvalidShareLinkError extends Error`.
- DOM helper: `queryRequired<T extends Element>(selector: string, root?: ParentNode): T` in `src/dom/queryRequired.ts` (throws when the element is missing, avoids non-null assertions forbidden by the linter).
- Components and pages:
  - `TransferForm.astro` (in `index.astro`): fields, submit, generated link output.
  - `TransferCard.astro` + `CopyButton.astro` (in `ver.astro`): renders decoded data, copy button per field using `navigator.clipboard.writeText`.
- UI copies:
  - `form.beneficiaryName.label`: "Nombre del beneficiario"
  - `form.clabe.label`: "CLABE interbancaria"
  - `form.clabe.placeholder`: "18 dígitos"
  - `form.submit`: "Generar enlace"
  - `form.generatedLink.label`: "Tu enlace para compartir"
  - `errors.required`: "Este campo es obligatorio"
  - `errors.clabe.length`: "La CLABE debe tener 18 dígitos"
  - `errors.clabe.nonNumeric`: "La CLABE solo puede contener números"
  - `view.heading`: "Datos para transferencia"
  - `view.invalidLink`: "Este enlace no es válido o está incompleto."
  - `view.createOwn`: "Crear mi propio enlace"
  - `view.beneficiaryName.label`: "Beneficiario"
  - `view.clabe.label`: "CLABE"
  - `copy.action`: "Copiar"
  - `copy.done`: "¡Copiado!"
- Test suites:
  - `tests/unit/spei/domain/Clabe.test.ts`
    - `creates a clabe from 18 digits`
    - `removes spaces and dashes before validating`
    - `fails when length is not 18`
    - `fails when it contains non numeric characters`
    - `formats the clabe in groups`
  - `tests/unit/spei/application/shareLink.test.ts`
    - `encodes and decodes the same transfer data`
    - `preserves accents and ñ in the beneficiary name`
    - `fails decoding a corrupted hash`
    - `fails decoding a payload with an invalid clabe`
  - `tests/e2e/share-flow.spec.ts`
    - `creates a link and shows the transfer data`
    - `copies the clabe to the clipboard`
    - `shows an error for a clabe with wrong length`
    - `shows the invalid link message for a corrupted hash`

### To-do

- [x] Create domain types, `Clabe` and `InvalidClabeError` with unit tests.
- [x] Create `encodeShareLink`, `decodeShareLink` and `InvalidShareLinkError` with unit tests.
- [x] Add UI copies to `src/i18n/es.ts`.
- [x] Build `TransferForm.astro` with client-side validation and generated link output, mount it in `index.astro`.
- [x] Build `CopyButton.astro`, `TransferCard.astro` and `src/pages/ver.astro` reading `location.hash`, with invalid link state.
- [x] Add `tests/e2e/share-flow.spec.ts` (grant clipboard permissions in Playwright).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 3: CLABE check digit validation and bank auto-detection

Reject CLABEs with a wrong check digit and show the bank detected from the first 3 digits in both the form and the shared card.

### Public contracts

- Domain:
  - `Clabe.create` also validates the check digit: weights `3, 7, 1` repeated over the first 17 digits, sum of `(digit * weight) % 10`, expected check digit `(10 - sum % 10) % 10`.
  - `InvalidClabeError.reason` adds `'check_digit'`.
  - `Clabe.bankCode: string` (first 3 digits).
  - `type Bank = { code: string; name: string }`.
  - `findBankByCode(code: string): Bank | undefined` backed by `src/spei/domain/banks.ts` with a curated subset of the Banxico SPEI participants catalog (unknown codes show "Banco no identificado"; review the list against the official Banxico catalog).
  - `SpeiTransferData` adds `bankName?: string` (filled automatically from the CLABE, decoded as an optional trimmed string).
- Components: `TransferCard.astro` adds a "Banco" row with its own copy button, hidden when there is no bank name.
- UI copies:
  - `errors.clabe.checkDigit`: "La CLABE no es válida, revisa el dígito verificador"
  - `form.clabe.detectedBank`: "Banco: {bankName}"
  - `form.clabe.unknownBank`: "Banco no identificado"
  - `view.bank.label`: "Banco"
- Test suites:
  - `tests/unit/spei/domain/Clabe.test.ts` (modified)
    - `fails when the check digit is wrong`
    - `exposes the bank code`
  - `tests/unit/spei/domain/banks.test.ts`
    - `finds BBVA México by code 012`
    - `finds Banamex by code 002`
    - `returns undefined for an unknown code`
  - `tests/unit/spei/application/shareLink.test.ts` (modified)
    - `encodes and decodes the bank name`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `shows the detected bank while typing a valid clabe`
    - `shows an error for a clabe with wrong check digit`
    - `shows the bank in the shared card`

### To-do

- [x] Add check digit validation and `bankCode` to `Clabe`, update unit tests (fix Phase 2 fixtures to valid CLABEs).
- [x] Create `banks.ts` catalog and `findBankByCode` with unit tests.
- [x] Show detected bank in `TransferForm.astro` and `TransferCard.astro`, include `bankName` in the encoded data.
- [x] Update e2e tests.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 4: Alternative destination: debit card or account number

Let the user choose CLABE, debit card or account number as destination. For card and account, the bank name is entered manually.

### Public contracts

- Domain:
  - `type TransferDestination = { type: 'clabe' | 'card' | 'account'; value: string }`.
  - `class CardNumber { static create(value: string): CardNumber; readonly value: string; formatted(): string }`: 16 digits, Luhn check, throws `InvalidCardNumberError` (`reason: 'length' | 'non_numeric' | 'checksum'`). `formatted()` groups as `XXXX XXXX XXXX XXXX`.
  - `class AccountNumber { static create(value: string): AccountNumber; readonly value: string }`: 10 or 11 digits, throws `InvalidAccountNumberError` (`reason: 'length' | 'non_numeric'`).
  - `bankName` is required when destination type is `card` or `account`.
  - `src/spei/domain/transferDestination.ts`: `isDestinationType(value: unknown): value is DestinationType`, `createTransferDestination(type: DestinationType, value: string): TransferDestination` and `formatTransferDestination(destination: TransferDestination): string`, shared by the form, the card and the share link decoder.
- Components:
  - `TextField.astro`: reusable labelled input with optional hint, error message and `showFor` visibility by destination type.
  - `TransferCard.astro`: the destination row label and copy button label change with the destination type ("CLABE", "Tarjeta", "Cuenta").
- UI copies:
  - `form.destinationType.label`: "Tipo de destino"
  - `form.destinationType.clabe`: "CLABE"
  - `form.destinationType.card`: "Tarjeta de débito"
  - `form.destinationType.account`: "Número de cuenta"
  - `form.card.label`: "Número de tarjeta"
  - `form.card.placeholder`: "16 dígitos"
  - `form.account.label`: "Número de cuenta"
  - `form.account.placeholder`: "10 u 11 dígitos"
  - `form.bankName.label`: "Banco"
  - `errors.card.length`: "La tarjeta debe tener 16 dígitos"
  - `errors.card.checksum`: "El número de tarjeta no es válido"
  - `errors.account.length`: "La cuenta debe tener 10 u 11 dígitos"
  - `errors.nonNumeric`: "Solo se permiten números"
  - `view.card.label`: "Tarjeta"
  - `view.account.label`: "Cuenta"
- Test suites:
  - `tests/unit/spei/domain/CardNumber.test.ts`
    - `creates a card number with a valid luhn checksum`
    - `fails when the luhn checksum is wrong`
    - `fails when length is not 16`
    - `fails with non numeric characters`
    - `formats the card in groups of 4`
  - `tests/unit/spei/domain/AccountNumber.test.ts`
    - `creates an account number with 10 digits`
    - `creates an account number with 11 digits`
    - `fails with any other length`
    - `fails with non numeric characters`
  - `tests/unit/spei/domain/transferDestination.test.ts`
    - `creates a normalized destination for each type`
    - `formats the destination according to its type`
    - `recognizes only supported destination types`
  - `tests/unit/spei/application/shareLink.test.ts` (modified)
    - `encodes and decodes a card destination`
    - `fails decoding a card destination without bank name`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `creates a link with a debit card destination`
    - `shows an error for an invalid card number`

### To-do

- [x] Create `CardNumber`, `AccountNumber` and their errors with unit tests.
- [x] Extend `TransferDestination` and `decodeShareLink` validation, update unit tests.
- [x] Add destination type selector and manual bank field to `TransferForm.astro`, render the right label in `TransferCard.astro`.
- [x] Update e2e tests.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 5: Optional fields: concept, amount, RFC and email

Add optional fields to the form and shared card. Empty fields are not encoded nor displayed.

### Public contracts

- Domain:
  - `SpeiTransferData` adds `concept?: string; amount?: string; rfc?: string; email?: string`.
  - `class Concept { static create(value: string): Concept }`: trimmed, max 40 characters, throws `InvalidConceptError`.
  - `class Amount { static create(value: string): Amount; formatted(): string }`: greater than 0, max 2 decimals, throws `InvalidAmountError`. `formatted()` returns MXN currency (`$1,234.50 MXN`).
  - `class Rfc { static create(value: string): Rfc }`: uppercased, 12 (persona moral) or 13 (persona física) characters matching SAT format, throws `InvalidRfcError`.
  - `class Email { static create(value: string): Email }`: basic format check, throws `InvalidEmailError`.
  - `Amount.create` ignores spaces, commas and `$`, and stores the value with 2 decimals (`"1,234.5"` becomes `"1234.50"`). `InvalidAmountError.reason` is `'format' | 'not_positive'`.
  - `type OptionalField = 'concept' | 'amount' | 'rfc' | 'email'` and `type OptionalTransferFields = Partial<Record<OptionalField, string>>` in `SpeiTransferData.ts`.
  - `src/spei/domain/optionalFields.ts`: `OPTIONAL_FIELDS`, `createOptionalField(field: OptionalField, value: string): string` and `formatOptionalField(field: OptionalField, value: string): string`, shared by the form, the card and the share link codec.
- Components: `TextField.astro` accepts `type` (`text` | `email`) and `required` props. Shared card copy buttons copy the raw amount (`1500.00`) while displaying it as currency.
- UI copies:
  - `form.optional.heading`: "Datos opcionales"
  - `form.concept.label`: "Concepto"
  - `form.amount.label`: "Monto (MXN)"
  - `form.rfc.label`: "RFC"
  - `form.email.label`: "Correo electrónico"
  - `errors.concept.tooLong`: "El concepto no puede superar 40 caracteres"
  - `errors.amount.invalid`: "Ingresa un monto mayor a 0 con máximo 2 decimales"
  - `errors.rfc.invalid`: "RFC inválido"
  - `errors.email.invalid`: "Correo electrónico inválido"
  - `view.concept.label`: "Concepto"
  - `view.amount.label`: "Monto"
  - `view.rfc.label`: "RFC"
  - `view.email.label`: "Correo"
- Test suites:
  - `tests/unit/spei/domain/Concept.test.ts`
    - `creates a trimmed concept`
    - `fails when longer than 40 characters`
  - `tests/unit/spei/domain/Amount.test.ts`
    - `creates an amount with 2 decimals`
    - `fails with zero or negative values`
    - `fails with more than 2 decimals`
    - `formats as MXN currency`
  - `tests/unit/spei/domain/Rfc.test.ts`
    - `creates a persona física rfc`
    - `creates a persona moral rfc`
    - `uppercases the rfc`
    - `fails with an invalid format`
  - `tests/unit/spei/domain/Email.test.ts`
    - `creates a valid email`
    - `fails with an invalid email`
  - `tests/unit/spei/domain/optionalFields.test.ts`
    - `normalizes each optional field`
    - `formats the amount as currency and keeps other fields as is`
  - `tests/unit/spei/application/shareLink.test.ts` (modified)
    - `encodes and decodes all optional fields`
    - `omits empty optional fields from the payload`
    - `fails decoding a payload with an invalid optional field`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `shows optional fields only when filled`
    - `shows an error for an invalid rfc`

### To-do

- [x] Create `Concept`, `Amount`, `Rfc`, `Email` and their errors with unit tests.
- [x] Extend `SpeiTransferData`, encoding (omit empties) and decoding validation, update unit tests.
- [x] Add optional fields section to `TransferForm.astro` and conditional rows to `TransferCard.astro`.
- [x] Update e2e tests.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 6: Sharing: QR code, Web Share API and copy all

Add a share actions block (form result and shared card) with QR code, native share and "copy all" as formatted text.

### Public contracts

- Application:
  - `formatTransferText(data: SpeiTransferData): string`: multi-line text with label and value per filled field, in fixed order (beneficiary, bank, destination, concept, amount, RFC, email).
  - `generateQrSvg(url: URL): Promise<string>`: SVG string using the `qrcode` package.
  - `shareTransfer(data: SpeiTransferData, url: URL, shareNavigator?: ShareCapableNavigator): Promise<ShareResult>` (`ShareResult = 'shared' | 'copied'`): uses `navigator.share` when available, otherwise copies `formatTransferText` + link to the clipboard. The navigator is injectable for tests. A cancelled native share (`AbortError`) is ignored by the UI.
  - `transferChannel.ts`: `publishTransfer(transfer: SharedTransfer | null): void` and `subscribeToTransfer(listener): () => void` (`SharedTransfer = { data: SpeiTransferData; url: URL }`). The form and the card publish the current transfer, `ShareActions` subscribes; the latest value is replayed so script order does not matter.
  - `transferLabels.ts`: `DESTINATION_LABELS` shared by `formatTransferText` and `TransferCard.astro`.
- Components:
  - `ShareActions.astro` (prop `showCopyLink`, `false` in `index.astro` because the generated link already has its copy button) used in `index.astro` (after generating) and `ver.astro`.
  - `CopyButton.astro` accepts an optional visible `text` and restores its original text after the "¡Copiado!" feedback.
- UI copies:
  - `share.heading`: "Compartir"
  - `share.copyAll`: "Copiar todo"
  - `share.copyLink`: "Copiar enlace"
  - `share.native`: "Compartir"
  - `share.qr.alt`: "Código QR con el enlace a tus datos SPEI"
  - `share.qr.download`: "Descargar QR"
  - `share.text.title`: "Datos para transferencia SPEI"
  - `share.copiedFallback`: "Tu dispositivo no permite compartir, copiamos los datos al portapapeles"
- Test suites:
  - `tests/unit/spei/application/formatTransferText.test.ts`
    - `formats all filled fields in order`
    - `omits empty optional fields`
    - `uses the formatted clabe or card`
  - `tests/unit/spei/application/generateQrSvg.test.ts`
    - `returns an svg string for a url`
  - `tests/unit/spei/application/shareTransfer.test.ts`
    - `uses the native share when available`
    - `falls back to clipboard when native share is not available`
  - `tests/e2e/share-flow.spec.ts` (modified)
    - `shows the qr code after generating the link`
    - `copies all data as formatted text`

### To-do

- [x] Add `qrcode` dependency (and `@types/qrcode`) in its own commit-ready step.
- [x] Create `formatTransferText`, `generateQrSvg` and `shareTransfer` with unit tests.
- [x] Build `ShareActions.astro` and mount it in both pages.
- [x] Update e2e tests.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## Phase 7: Remember the last entered data in localStorage

Prefill the form with the last data the user generated a link for, with an option to clear it.

### Public contracts

- Application:
  - `saveDraft(data: SpeiTransferData, storage?: Storage): void`
  - `loadDraft(storage?: Storage): SpeiTransferData | null`: returns `null` when missing, corrupted or invalid, and when storage access throws.
  - `clearDraft(storage?: Storage): void`
  - Storage key: `spei-share:draft:v1`.
- UI copies:
  - `form.draft.restored`: "Recuperamos tus últimos datos"
  - `form.draft.clear`: "Borrar datos guardados"
- Test suites:
  - `tests/unit/spei/application/draftStorage.test.ts`
    - `saves and loads the same transfer data`
    - `returns null when there is no draft`
    - `returns null when the draft is corrupted`
    - `returns null when storage throws`
    - `clears the draft`
  - `tests/e2e/draft.spec.ts`
    - `prefills the form after reloading`
    - `clears the saved data`

### To-do

- [ ] Create `saveDraft`, `loadDraft` and `clearDraft` with unit tests.
- [ ] Save on link generation, prefill on load and add clear button in `TransferForm.astro`.
- [ ] Add `tests/e2e/draft.spec.ts`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

# ⏭️ Next step

Implement Phase 7: remember the last entered data in localStorage.

With a QR on its shell, the turtle hands out its details to every friend it meets on the way to the bank, thanks to [Codely](https://codely.com) 🧱 🐢 💨 🔗 🔍 💳 📝 📱 🏦
