import { describe, expect, it } from "vitest";
import { findBankByCode } from "../../../../src/spei/domain/banks";

describe("findBankByCode", () => {
  it("finds BBVA México by code 012", () => {
    expect(findBankByCode("012")).toEqual({ code: "012", name: "BBVA México" });
  });

  it("finds Banamex by code 002", () => {
    expect(findBankByCode("002")).toEqual({ code: "002", name: "Banamex" });
  });

  it("returns undefined for an unknown code", () => {
    expect(findBankByCode("999")).toBeUndefined();
  });
});
