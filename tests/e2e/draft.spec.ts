import { expect, test, type Page } from "@playwright/test";

const BENEFICIARY = "José Peña Muñoz";
const DRAFT_STORAGE_KEY = "spei-share:draft:v2";

async function fillCardForm(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill(BENEFICIARY);
  await page.getByRole("radio", { name: "Tarjeta de débito" }).check();
  await page.getByRole("textbox", { name: "Número de tarjeta" }).fill("4111111111111111");
  await page.getByLabel("Banco", { exact: true }).fill("Nu México");
  await page.getByLabel("Concepto").fill("Renta octubre");
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), DRAFT_STORAGE_KEY))
    .toContain("Renta octubre");
}

test("prefills the form after reloading", async ({ page }) => {
  await fillCardForm(page);

  await page.reload();

  await expect(page.getByText("Recuperamos tus últimos datos")).toBeVisible();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue(BENEFICIARY);
  await expect(page.getByRole("radio", { name: "Tarjeta de débito" })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Número de tarjeta" })).toHaveValue(
    "4111 1111 1111 1111",
  );
  await expect(page.getByLabel("Banco", { exact: true })).toHaveValue("Nu México");
  await expect(page.getByLabel("Concepto")).toHaveValue("Renta octubre");
});

test("starts over clearing the form and the draft", async ({ page }) => {
  await fillCardForm(page);
  await page.reload();

  await page.getByRole("button", { name: "Empezar de nuevo" }).click();

  await expect(page.getByText("Recuperamos tus últimos datos")).toBeHidden();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue("");
  await expect(page.getByLabel("Nombre del beneficiario")).toBeFocused();
  await expect(page.getByRole("radio", { name: "CLABE" })).toBeChecked();

  await page.reload();
  await expect(page.getByText("Recuperamos tus últimos datos")).toBeHidden();
  await expect(page.getByLabel("Nombre del beneficiario")).toHaveValue("");
});
