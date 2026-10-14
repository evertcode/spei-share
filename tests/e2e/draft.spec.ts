import { expect, test, type Page } from "@playwright/test";

const BENEFICIARY = "José Peña Muñoz";
const CARD = "4111 1111 1111 1111";

async function generateCardLink(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByRole("radio", { name: "Tarjeta de débito" }).check();
  await page.getByRole("textbox", { name: "Número de tarjeta" }).fill(CARD);
  await page.getByRole("textbox", { name: "Banco", exact: true }).fill("Nu México");
  await page.getByLabel("Concepto").fill("Renta octubre");
  await page.getByRole("button", { name: "Generar enlace" }).click();
  await expect(page.getByLabel("Tu enlace para compartir", { exact: true })).toBeVisible();
}

test("prefills the form after reloading", async ({ page }) => {
  await generateCardLink(page);

  await page.reload();

  await expect(page.getByText("Recuperamos tus últimos datos")).toBeVisible();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue(BENEFICIARY);
  await expect(page.getByRole("radio", { name: "Tarjeta de débito" })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Número de tarjeta" })).toHaveValue(
    "4111111111111111",
  );
  await expect(page.getByRole("textbox", { name: "Banco", exact: true })).toHaveValue("Nu México");
  await expect(page.getByLabel("Concepto")).toHaveValue("Renta octubre");
});

test("clears the saved data", async ({ page }) => {
  await generateCardLink(page);
  await page.reload();

  await page.getByRole("button", { name: "Borrar datos guardados" }).click();

  await expect(page.getByText("Recuperamos tus últimos datos")).toBeHidden();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue("");
  await expect(page.getByRole("radio", { name: "CLABE" })).toBeChecked();

  await page.reload();
  await expect(page.getByText("Recuperamos tus últimos datos")).toBeHidden();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue("");
});
