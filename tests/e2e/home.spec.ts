import { expect, test } from "@playwright/test";

test("shows the home heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Comparte tus datos SPEI" }),
  ).toBeVisible();
});
