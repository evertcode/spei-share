import { describe, expect, it } from "vitest";
import {
  emptyTransferFormValues,
  formatTransferField,
  validateTransferField,
  validateTransferForm,
  type TransferFormValues,
} from "../../../../src/spei/application/validateTransferForm";

function formValues(overrides: Partial<TransferFormValues> = {}): TransferFormValues {
  return {
    ...emptyTransferFormValues(),
    beneficiaryName: "José Peña Muñoz",
    clabe: "012 180 00123456789 9",
    ...overrides,
  };
}

describe("validateTransferForm", () => {
  it("returns transfer data for a valid clabe form", () => {
    expect(validateTransferForm(formValues({ concept: " Renta " }))).toEqual({
      ok: true,
      data: {
        beneficiaryName: "José Peña Muñoz",
        destination: { type: "clabe", value: "012180001234567899" },
        bankName: "BBVA México",
        concept: "Renta",
      },
    });
  });

  it("requires the bank name for card and account destinations", () => {
    const result = validateTransferForm(
      formValues({ destinationType: "card", card: "4111 1111 1111 1111" }),
    );

    expect(result).toEqual({ ok: false, errors: { bankName: "Este campo es obligatorio" } });
  });

  it("returns an error per invalid field", () => {
    const result = validateTransferForm(
      formValues({ beneficiaryName: " ", clabe: "123", rfc: "XX", amount: "0" }),
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        beneficiaryName: "Este campo es obligatorio",
        clabe: "La CLABE debe tener 18 dígitos",
        rfc: "RFC inválido",
        amount: "Ingresa un monto mayor a 0 con máximo 2 decimales",
      },
    });
  });

  it("ignores empty optional fields and inactive destination fields", () => {
    const result = validateTransferForm(formValues({ card: "not a card", email: "  " }));

    expect(result.ok).toBe(true);
  });

  it("validates a single field", () => {
    const values = formValues({ clabe: "012180001234567890" });

    expect(validateTransferField("clabe", values)).toBe(
      "La CLABE no es válida, revisa el dígito verificador",
    );
    expect(validateTransferField("beneficiaryName", values)).toBeUndefined();
    expect(validateTransferField("bankName", values)).toBeUndefined();
  });

  it("formats clabe, card, amount and rfc for display", () => {
    expect(formatTransferField("clabe", "012180001234567899")).toBe("012 180 00123456789 9");
    expect(formatTransferField("card", "4111111111111111")).toBe("4111 1111 1111 1111");
    expect(formatTransferField("amount", "1500")).toBe("1,500.00");
    expect(formatTransferField("rfc", "gode561231gr8")).toBe("GODE561231GR8");
    expect(formatTransferField("clabe", "123")).toBe("123");
  });
});
