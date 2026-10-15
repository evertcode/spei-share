import { expect, test, type Page } from "@playwright/test";

const BENEFICIARY = "José Peña Muñoz";
const CLABE = "012180001234567899";

async function createLink(page: Page, clabe = CLABE): Promise<string> {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByLabel("CLABE interbancaria").fill(clabe);
  await page.getByRole("button", { name: "Generar enlace" }).click();

  return page.getByLabel("Tu enlace para compartir", { exact: true }).inputValue();
}

test("creates a link and shows the transfer data", async ({ page }) => {
  const link = await createLink(page);

  await page.goto(link);

  await expect(page.getByRole("heading", { name: "Datos para transferencia" })).toBeVisible();
  await expect(page.getByText(BENEFICIARY)).toBeVisible();
  await expect(page.getByText("012 180 00123456789 9")).toBeVisible();
});

test("copies the clabe to the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(await createLink(page));

  const copyButton = page.getByRole("button", { name: "Copiar CLABE" });
  await copyButton.click();

  await expect(copyButton).toHaveText("¡Copiado!");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(CLABE);
});

test("shows an error for a clabe with wrong length", async ({ page }) => {
  await createLink(page, "12345");

  await expect(page.getByText("La CLABE debe tener 18 dígitos")).toBeVisible();
  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeHidden();
});

test("shows the detected bank while typing a valid clabe", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("CLABE interbancaria").fill(CLABE);

  await expect(page.getByText("Banco: BBVA México")).toBeVisible();
});

test("shows an error for a clabe with wrong check digit", async ({ page }) => {
  await createLink(page, "012180001234567890");

  await expect(page.getByText("La CLABE no es válida, revisa el dígito verificador")).toBeVisible();
  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeHidden();
});

test("shows the bank in the shared card", async ({ page }) => {
  await page.goto(await createLink(page));

  await expect(page.getByRole("button", { name: "Copiar Banco" })).toBeVisible();
  await expect(page.getByText("BBVA México", { exact: true })).toBeVisible();
});

test("creates a link with a debit card destination", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByRole("radio", { name: "Tarjeta de débito" }).check();
  await page.getByRole("textbox", { name: "Número de tarjeta" }).fill("4111 1111 1111 1111");
  await page.getByLabel("Banco", { exact: true }).fill("Nu México");
  await page.getByRole("button", { name: "Generar enlace" }).click();

  await page.goto(await page.getByLabel("Tu enlace para compartir", { exact: true }).inputValue());

  await expect(page.getByText("4111 1111 1111 1111")).toBeVisible();
  await expect(page.getByText("Nu México", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar Tarjeta" })).toBeVisible();
});

test("shows an error for an invalid card number", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByRole("radio", { name: "Tarjeta de débito" }).check();
  await page.getByRole("textbox", { name: "Número de tarjeta" }).fill("4111111111111112");
  await page.getByLabel("Banco", { exact: true }).fill("Nu México");
  await page.getByRole("button", { name: "Generar enlace" }).click();

  await expect(page.getByText("El número de tarjeta no es válido")).toBeVisible();
  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeHidden();
});

test("shows optional fields only when filled", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByLabel("CLABE interbancaria").fill(CLABE);
  await page.getByLabel("Concepto").fill("Renta octubre");
  await page.getByLabel("Monto (MXN)").fill("1500");
  await page.getByRole("button", { name: "Generar enlace" }).click();

  await page.goto(await page.getByLabel("Tu enlace para compartir", { exact: true }).inputValue());

  await expect(page.getByText("Renta octubre")).toBeVisible();
  await expect(page.getByText("$1,500.00 MXN")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar Concepto" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar RFC" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Copiar Correo" })).toBeHidden();
});

test("shows an error for an invalid rfc", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByLabel("CLABE interbancaria").fill(CLABE);
  await page.getByLabel("RFC").fill("NOT-AN-RFC");
  await page.getByRole("button", { name: "Generar enlace" }).click();

  await expect(page.getByText("RFC inválido")).toBeVisible();
  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeHidden();
});

test("shows the qr code after generating the link", async ({ page }) => {
  await createLink(page);

  const qr = page.getByRole("img", { name: "Código QR con el enlace a tus datos SPEI" });
  await expect(qr).toBeVisible();
  await expect(qr.locator("svg")).toBeVisible();
  await expect(page.getByRole("link", { name: "Descargar QR" })).toHaveAttribute("href", /^blob:/);
});

test("copies all data as formatted text", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const link = await createLink(page);
  await page.goto(link);

  await page.getByRole("button", { name: "Copiar todo" }).click();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("Datos para transferencia SPEI");
  expect(clipboard).toContain(`Beneficiario: ${BENEFICIARY}`);
  expect(clipboard).toContain("CLABE: 012 180 00123456789 9");
  expect(clipboard.endsWith(link)).toBe(true);
});

test("does not animate when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await createLink(page);

  const animationName = await page
    .locator("#share-actions")
    .evaluate((element) => getComputedStyle(element).animationName);

  expect(animationName).toBe("none");
});

test("validates a field when leaving it", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("CLABE interbancaria").fill("12345");
  await page.getByLabel("CLABE interbancaria").press("Tab");

  await expect(page.getByText("La CLABE debe tener 18 dígitos")).toBeVisible();

  await page.getByLabel("CLABE interbancaria").fill(CLABE);
  await expect(page.getByText("La CLABE debe tener 18 dígitos")).toBeHidden();
});

test("focuses the first invalid field on submit", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Generar enlace" }).click();

  await expect(page.getByLabel("Nombre del beneficiario")).toBeFocused();
});

test("hides the generated link when the form changes", async ({ page }) => {
  await createLink(page);

  await page.getByLabel("Concepto").fill("Renta");

  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeHidden();
  await expect(page.getByText("Cambiaste datos, vuelve a generar el enlace")).toBeVisible();
});

test("formats the clabe when leaving the field", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("CLABE interbancaria").fill(CLABE);
  await page.getByLabel("CLABE interbancaria").press("Tab");

  await expect(page.getByLabel("CLABE interbancaria")).toHaveValue("012 180 00123456789 9");
});

test("shows the destination as the first row with a primary copy button", async ({ page }) => {
  await page.goto(await createLink(page));

  await expect(page.locator("[data-row]").first()).toHaveAttribute("data-row", "destination");
  await expect(page.getByRole("button", { name: "Copiar CLABE" })).toHaveAttribute(
    "data-variant",
    "primary",
  );
});

test("shows instructions for the payer", async ({ page }) => {
  await page.goto(await createLink(page));

  await expect(
    page.getByText("Copia los datos y transfiere desde la app de tu banco."),
  ).toBeVisible();
});

test("shows help for the payer when the link is invalid", async ({ page }) => {
  await page.goto("/ver#d=corrupted");

  await expect(
    page.getByText("Pide a quien te lo envió que comparta el enlace completo de nuevo."),
  ).toBeVisible();
});

test("shows the invalid link message for a corrupted hash", async ({ page }) => {
  await page.goto("/ver#d=corrupted");

  await expect(page.getByRole("alert")).toContainText(
    "Este enlace no es válido o está incompleto.",
  );
  await expect(page.getByRole("link", { name: "Crear mi propio enlace" })).toBeVisible();
});
