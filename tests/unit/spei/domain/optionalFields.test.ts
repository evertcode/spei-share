import { describe, expect, it } from "vitest";
import {
  createOptionalField,
  formatOptionalField,
} from "../../../../src/spei/domain/optionalFields";

describe("optionalFields", () => {
  it("normalizes each optional field", () => {
    expect(createOptionalField("concept", " Renta ")).toBe("Renta");
    expect(createOptionalField("amount", "1,500")).toBe("1500.00");
    expect(createOptionalField("rfc", "gode561231gr8")).toBe("GODE561231GR8");
    expect(createOptionalField("email", "ada@example.com")).toBe("ada@example.com");
  });

  it("formats the amount as currency and keeps other fields as is", () => {
    expect(formatOptionalField("amount", "1500.00")).toBe("$1,500.00 MXN");
    expect(formatOptionalField("concept", "Renta")).toBe("Renta");
  });
});
