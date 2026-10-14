import { describe, expect, it } from "vitest";
import { Concept } from "../../../../src/spei/domain/Concept";

describe("Concept", () => {
  it("creates a trimmed concept", () => {
    expect(Concept.create("  Renta octubre  ").value).toBe("Renta octubre");
  });

  it("fails when longer than 40 characters", () => {
    expect(() => Concept.create("a".repeat(41))).toThrow(
      expect.objectContaining({ name: "InvalidConceptError", reason: "too_long" }),
    );
  });
});
