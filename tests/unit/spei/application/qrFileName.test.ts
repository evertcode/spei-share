import { describe, expect, it } from "vitest";
import { qrFileName } from "../../../../src/spei/application/qrFileName";

describe("qrFileName", () => {
  it("uses the last four digits of the destination", () => {
    expect(qrFileName({ type: "clabe", value: "012180001234567899" })).toBe("spei-7899.svg");
    expect(qrFileName({ type: "card", value: "4111111111111111" })).toBe("spei-1111.svg");
  });
});
