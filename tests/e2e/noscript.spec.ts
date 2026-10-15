import { expect, test } from "@playwright/test";

// Playwright's `javaScriptEnabled: false` only blocks script execution: Chromium still parses
// <noscript> as raw text, so the served HTML is asserted instead of the rendered page.
test("explains that javascript is required", async ({ request }) => {
  const response = await request.get("/ver");
  const html = await response.text();

  expect(html).toMatch(
    /<noscript>[\s\S]*Activa JavaScript para ver los datos de este enlace\.[\s\S]*<\/noscript>/,
  );
});
