import { describe, expect, it } from "vitest";
import { AccountNumber } from "../../../../src/spei/domain/AccountNumber";
import { InvalidAccountNumberError } from "../../../../src/spei/domain/InvalidAccountNumberError";

function expectInvalidAccount(value: string, reason: InvalidAccountNumberError["reason"]): void {
  expect(() => AccountNumber.create(value)).toThrow(
    expect.objectContaining({ name: "InvalidAccountNumberError", reason }),
  );
}

describe("AccountNumber", () => {
  it("creates an account number with 10 digits", () => {
    expect(AccountNumber.create("1234567890").value).toBe("1234567890");
  });

  it("creates an account number with 11 digits", () => {
    expect(AccountNumber.create("123 4567 8901").value).toBe("12345678901");
  });

  it("fails with any other length", () => {
    expectInvalidAccount("123456789", "length");
    expectInvalidAccount("123456789012", "length");
  });

  it("fails with non numeric characters", () => {
    expectInvalidAccount("12345a7890", "non_numeric");
  });
});
