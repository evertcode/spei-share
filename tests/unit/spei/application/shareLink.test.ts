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

  it("encodes and decodes the bank name", () => {
    const data = transferData({ bankName: "BBVA México" });

    expect(decodeShareLink(encodeShareLink(data, BASE_URL).hash)).toEqual(data);
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

  it("encodes and decodes a card destination", () => {
    const data = transferData({
      destination: { type: "card", value: "4111111111111111" },
      bankName: "Nu México",
    });

    expect(decodeShareLink(encodeShareLink(data, BASE_URL).hash)).toEqual(data);
  });

  it("fails decoding a card destination without bank name", () => {
    const hash = hashFor(
      transferData({ destination: { type: "card", value: "4111111111111111" } }),
    );

    expect(() => decodeShareLink(hash)).toThrow(InvalidShareLinkError);
  });

  it("encodes and decodes all optional fields", () => {
    const data = transferData({
      concept: "Renta octubre",
      amount: "1500.00",
      rfc: "GODE561231GR8",
      email: "ada@example.com",
    });

    expect(decodeShareLink(encodeShareLink(data, BASE_URL).hash)).toEqual(data);
  });

  it("omits empty optional fields from the payload", () => {
    const url = encodeShareLink(transferData({ concept: "", email: "  " }), BASE_URL);
    const encoded = new URLSearchParams(url.hash.slice(1)).get("d") ?? "";
    const payload: unknown = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));

    expect(payload).not.toHaveProperty("concept");
    expect(payload).not.toHaveProperty("email");
    expect(decodeShareLink(url.hash)).toEqual(transferData());
  });

  it("fails decoding a payload with an invalid optional field", () => {
    expect(() => decodeShareLink(hashFor(transferData({ rfc: "invalid" })))).toThrow(
      InvalidShareLinkError,
    );
  });

  it("fails decoding a payload with an invalid clabe", () => {
    const hash = hashFor(transferData({ destination: { type: "clabe", value: "123" } }));

    expect(() => decodeShareLink(hash)).toThrow(InvalidShareLinkError);
  });
});
