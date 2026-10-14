import { expect, test } from "@playwright/test";

const html = (page: import("@playwright/test").Page) => page.locator("html");

test("follows the system dark preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });

  await page.goto("/");

  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Cambiar a tema claro" })).toBeVisible();
});

test("toggles the theme with the header button", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(html(page)).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "Cambiar a tema oscuro" }).click();

  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Cambiar a tema claro" })).toBeVisible();
});

test("remembers the chosen theme after reloading", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Cambiar a tema oscuro" }).click();

  await page.reload();

  await expect(html(page)).toHaveAttribute("data-theme", "dark");
});
