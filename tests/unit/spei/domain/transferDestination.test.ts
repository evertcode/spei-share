import { describe, expect, it } from "vitest";
import {
  createTransferDestination,
  formatTransferDestination,
  isDestinationType,
} from "../../../../src/spei/domain/transferDestination";

describe("transferDestination", () => {
  it("creates a normalized destination for each type", () => {
    expect(createTransferDestination("clabe", "012 180 00123456789 9")).toEqual({
      type: "clabe",
      value: "012180001234567899",
    });
    expect(createTransferDestination("card", "4111 1111 1111 1111")).toEqual({
      type: "card",
      value: "4111111111111111",
    });
    expect(createTransferDestination("account", "1234-567890")).toEqual({
      type: "account",
      value: "1234567890",
    });
  });

  it("formats the destination according to its type", () => {
    expect(formatTransferDestination({ type: "clabe", value: "012180001234567899" })).toBe(
      "012 180 00123456789 9",
    );
    expect(formatTransferDestination({ type: "card", value: "4111111111111111" })).toBe(
      "4111 1111 1111 1111",
    );
    expect(formatTransferDestination({ type: "account", value: "1234567890" })).toBe("1234567890");
  });

  it("recognizes only supported destination types", () => {
    expect(isDestinationType("card")).toBe(true);
    expect(isDestinationType("paypal")).toBe(false);
  });
});
