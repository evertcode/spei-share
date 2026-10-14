import { describe, expect, it } from "vitest";
import { Amount } from "../../../../src/spei/domain/Amount";
import type { InvalidAmountError } from "../../../../src/spei/domain/InvalidAmountError";

function expectInvalidAmount(value: string, reason: InvalidAmountError["reason"]): void {
  expect(() => Amount.create(value)).toThrow(
    expect.objectContaining({ name: "InvalidAmountError", reason }),
  );
}

describe("Amount", () => {
  it("creates an amount with 2 decimals", () => {
    expect(Amount.create("1,234.5").value).toBe("1234.50");
    expect(Amount.create("$350").value).toBe("350.00");
  });

  it("fails with zero or negative values", () => {
    expectInvalidAmount("0", "not_positive");
    expectInvalidAmount("-10", "format");
  });

  it("fails with more than 2 decimals", () => {
    expectInvalidAmount("10.555", "format");
  });

  it("formats as MXN currency", () => {
    expect(Amount.create("1234.5").formatted()).toBe("$1,234.50 MXN");
  });
});
