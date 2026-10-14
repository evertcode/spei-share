import { describe, expect, it } from "vitest";
import { Clabe } from "../../../../src/spei/domain/Clabe";
import { InvalidClabeError } from "../../../../src/spei/domain/InvalidClabeError";

const VALID_CLABE = "012180001234567899";

function expectInvalidClabe(value: string, reason: InvalidClabeError["reason"]): void {
  expect(() => Clabe.create(value)).toThrow(InvalidClabeError);
  try {
    Clabe.create(value);
  } catch (error) {
    expect((error as InvalidClabeError).reason).toBe(reason);
  }
}

describe("Clabe", () => {
  it("creates a clabe from 18 digits", () => {
    expect(Clabe.create(VALID_CLABE).value).toBe(VALID_CLABE);
  });

  it("removes spaces and dashes before validating", () => {
    expect(Clabe.create("012 180-00123456789 9").value).toBe(VALID_CLABE);
  });

  it("fails when length is not 18", () => {
    expectInvalidClabe("01218000123456789", "length");
    expectInvalidClabe("0121800012345678990", "length");
  });

  it("fails when it contains non numeric characters", () => {
    expectInvalidClabe("01218000123456789A", "non_numeric");
  });

  it("fails when the check digit is wrong", () => {
    expectInvalidClabe("012180001234567890", "check_digit");
  });

  it("exposes the bank code", () => {
    expect(Clabe.create(VALID_CLABE).bankCode).toBe("012");
  });

  it("formats the clabe in groups", () => {
    expect(Clabe.create(VALID_CLABE).formatted()).toBe("012 180 00123456789 9");
  });
});
