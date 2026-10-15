import { expect, test } from "@playwright/test";

test("marks the shared page as noindex", async ({ page }) => {
  await page.goto("/ver#d=anything");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");

  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("uses a payer oriented description on the shared page", async ({ page }) => {
  await page.goto("/ver#d=anything");

  const description = "Te compartieron datos para una transferencia SPEI.";
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    description,
  );
});
