import { expect, test, type Page } from "@playwright/test";

const MIN_TARGET_SIZE = 44;
const MIN_TEXT_CONTRAST = 4.5;

async function createLink(page: Page): Promise<string> {
  await page.goto("/");
  await page.getByLabel("Nombre del beneficiario").fill("José Peña Muñoz");
  await page.getByLabel("CLABE interbancaria").fill("012180001234567899");
  await page.getByRole("button", { name: "Generar enlace" }).click();

  return page.getByLabel("Tu enlace para compartir", { exact: true }).inputValue();
}

// Runs in the browser: contrast ratio between an input placeholder and the page background.
function placeholderContrast(): number {
  const toRgb = (color: string): number[] => {
    const canvas = document.createElement("canvas").getContext("2d");
    if (!canvas) throw new Error("Canvas not available");
    canvas.fillStyle = color;
    canvas.fillRect(0, 0, 1, 1);
    return Array.from(canvas.getImageData(0, 0, 1, 1).data.slice(0, 3));
  };
  const luminance = (rgb: number[]): number => {
    const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const input = document.querySelector("#clabe");
  if (!input) throw new Error("Missing #clabe");
  const foreground = luminance(toRgb(getComputedStyle(input, "::placeholder").color));
  const background = luminance(toRgb(getComputedStyle(document.body).backgroundColor));
  const [lighter, darker] = [Math.max(foreground, background), Math.min(foreground, background)];

  return (lighter + 0.05) / (darker + 0.05);
}

test("skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("main#main")).toBeFocused();
});

test("placeholders meet 4.5:1 contrast in light and dark themes", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");

    expect(await page.evaluate(placeholderContrast)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  }
});

test("interactive controls are at least 44px tall", async ({ page }) => {
  await page.goto(await createLink(page));

  const controls = [
    page.getByRole("button", { name: "Copiar CLABE" }),
    page.getByRole("button", { name: "Copiar todo" }),
    page.getByRole("button", { name: "Copiar enlace" }),
    page.locator("#theme-toggle"),
  ];
  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
  }

  await page.goto("/");
  const segment = page.locator("label").filter({ has: page.getByRole("radio", { name: "CLABE" }) });
  expect((await segment.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
});

test("keeps a visible indicator on the selected destination in forced colors mode", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");

  const selected = page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name: "CLABE" }) });
  const style = await selected.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { decoration: computed.textDecorationLine, weight: Number(computed.fontWeight) };
  });

  expect(style.decoration).toContain("underline");
  expect(style.weight).toBeGreaterThanOrEqual(700);
});
