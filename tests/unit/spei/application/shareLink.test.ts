import { describe, expect, it } from "vitest";
import { InvalidShareLinkError } from "../../../../src/spei/application/InvalidShareLinkError";
import { decodeShareLink, encodeShareLink } from "../../../../src/spei/application/shareLink";
import type { SpeiTransferData } from "../../../../src/spei/domain/SpeiTransferData";

const BASE_URL = new URL("https://spei.example");

function transferData(overrides: Partial<SpeiTransferData> = {}): SpeiTransferData {
  return {
    beneficiaryName: "Ada Lovelace",
    destination: { type: "clabe", value: "012180001234567899" },
    ...overrides,
  };
}

function hashFor(payload: unknown): string {
  const json = JSON.stringify(payload);
  return `#d=${btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

describe("shareLink", () => {
  it("encodes and decodes the same transfer data", () => {
    const data = transferData();

    const url = encodeShareLink(data, BASE_URL);

    expect(url.origin + url.pathname).toBe("https://spei.example/ver");
    expect(decodeShareLink(url.hash)).toEqual(data);
  });

  it("preserves accents and ñ in the beneficiary name", () => {
    const data = transferData({ beneficiaryName: "José Peña Muñoz" });

    expect(decodeShareLink(encodeShareLink(data, BASE_URL).hash)).toEqual(data);
  });

  it("fails decoding a corrupted hash", () => {
    expect(() => decodeShareLink("#d=%%%not-base64")).toThrow(InvalidShareLinkError);
    expect(() => decodeShareLink("#d=bm90LWpzb24")).toThrow(InvalidShareLinkError);
    expect(() => decodeShareLink("")).toThrow(InvalidShareLinkError);
  });

  it("fails decoding a payload with an invalid clabe", () => {
    const hash = hashFor(transferData({ destination: { type: "clabe", value: "123" } }));

    expect(() => decodeShareLink(hash)).toThrow(InvalidShareLinkError);
  });
});
