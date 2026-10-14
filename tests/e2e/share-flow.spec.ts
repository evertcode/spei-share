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

test("shows the invalid link message for a corrupted hash", async ({ page }) => {
  await page.goto("/ver#d=corrupted");

  await expect(page.getByRole("alert")).toContainText(
    "Este enlace no es válido o está incompleto.",
  );
  await expect(page.getByRole("link", { name: "Crear mi propio enlace" })).toBeVisible();
});
