import { describe, expect, it } from "vitest";
import { Email } from "../../../../src/spei/domain/Email";

describe("Email", () => {
  it("creates a valid email", () => {
    expect(Email.create(" ada@example.com ").value).toBe("ada@example.com");
  });

  it("fails with an invalid email", () => {
    expect(() => Email.create("ada@example")).toThrow(
      expect.objectContaining({ name: "InvalidEmailError", reason: "format" }),
    );
  });
});
