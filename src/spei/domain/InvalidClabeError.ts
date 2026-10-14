export type InvalidClabeReason = "length" | "non_numeric" | "check_digit";

export class InvalidClabeError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidClabeReason,
  ) {
    super(`Invalid CLABE <${value}>: ${reason}`);
    this.name = "InvalidClabeError";
  }
}
