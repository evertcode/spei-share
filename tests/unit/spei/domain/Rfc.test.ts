import { describe, expect, it } from "vitest";
import { Rfc } from "../../../../src/spei/domain/Rfc";

describe("Rfc", () => {
  it("creates a persona física rfc", () => {
    expect(Rfc.create("GODE561231GR8").value).toBe("GODE561231GR8");
  });

  it("creates a persona moral rfc", () => {
    expect(Rfc.create("ABC680524P76").value).toBe("ABC680524P76");
  });

  it("uppercases the rfc", () => {
    expect(Rfc.create("gode561231gr8").value).toBe("GODE561231GR8");
  });

  it("fails with an invalid format", () => {
    expect(() => Rfc.create("GODE56123")).toThrow(
      expect.objectContaining({ name: "InvalidRfcError", reason: "format" }),
    );
  });
});
