import { describe, expect, it } from "vitest";
import { CardNumber } from "../../../../src/spei/domain/CardNumber";
import { InvalidCardNumberError } from "../../../../src/spei/domain/InvalidCardNumberError";

const VALID_CARD = "4111111111111111";

function expectInvalidCard(value: string, reason: InvalidCardNumberError["reason"]): void {
  expect(() => CardNumber.create(value)).toThrow(
    expect.objectContaining({ name: "InvalidCardNumberError", reason }),
  );
}

describe("CardNumber", () => {
  it("creates a card number with a valid luhn checksum", () => {
    expect(CardNumber.create("4111 1111-1111 1111").value).toBe(VALID_CARD);
  });

  it("fails when the luhn checksum is wrong", () => {
    expectInvalidCard("4111111111111112", "checksum");
  });

  it("fails when length is not 16", () => {
    expectInvalidCard("411111111111111", "length");
  });

  it("fails with non numeric characters", () => {
    expectInvalidCard("4111a11111111111", "non_numeric");
  });

  it("formats the card in groups of 4", () => {
    expect(CardNumber.create(VALID_CARD).formatted()).toBe("4111 1111 1111 1111");
  });
});
