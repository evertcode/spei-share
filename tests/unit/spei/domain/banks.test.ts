import { describe, expect, it } from "vitest";
import { findBankByCode, listBanks } from "../../../../src/spei/domain/banks";

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

  it("lists every bank in the catalog", () => {
    const banks = listBanks();

    expect(banks).toContainEqual({ code: "012", name: "BBVA México" });
    expect(banks.every((bank) => findBankByCode(bank.code) === bank)).toBe(true);
  });
});
