import { describe, expect, it } from "vitest";
import { formatTransferText } from "../../../../src/spei/application/formatTransferText";

describe("formatTransferText", () => {
  it("formats all filled fields in order", () => {
    const text = formatTransferText({
      beneficiaryName: "Ada Lovelace",
      bankName: "BBVA México",
      destination: { type: "clabe", value: "012180001234567899" },
      concept: "Renta octubre",
      amount: "1500.00",
      rfc: "GODE561231GR8",
      email: "ada@example.com",
    });

    expect(text).toBe(
      [
        "Datos para transferencia SPEI",
        "Beneficiario: Ada Lovelace",
        "Banco: BBVA México",
        "CLABE: 012 180 00123456789 9",
        "Concepto: Renta octubre",
        "Monto: $1,500.00 MXN",
        "RFC: GODE561231GR8",
        "Correo: ada@example.com",
      ].join("\n"),
    );
  });

  it("omits empty optional fields", () => {
    const text = formatTransferText({
      beneficiaryName: "Ada Lovelace",
      destination: { type: "account", value: "1234567890" },
      bankName: "Banorte",
    });

    expect(text).toBe(
      [
        "Datos para transferencia SPEI",
        "Beneficiario: Ada Lovelace",
        "Banco: Banorte",
        "Cuenta: 1234567890",
      ].join("\n"),
    );
  });

  it("uses the formatted clabe or card", () => {
    const text = formatTransferText({
      beneficiaryName: "Ada Lovelace",
      destination: { type: "card", value: "4111111111111111" },
      bankName: "Nu México",
    });

    expect(text).toContain("Tarjeta: 4111 1111 1111 1111");
  });
});
