import { describe, expect, it } from "vitest";
import { generateQrSvg } from "../../../../src/spei/application/generateQrSvg";

describe("generateQrSvg", () => {
  it("returns an svg string for a url", async () => {
    const svg = await generateQrSvg(new URL("https://spei.example/ver#d=abc"));

    expect(svg.trim()).toMatch(/^<svg[\s\S]*<\/svg>$/);
  });
});
