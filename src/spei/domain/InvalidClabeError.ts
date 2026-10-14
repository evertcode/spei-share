export type InvalidClabeReason = "length" | "non_numeric";

export class InvalidClabeError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidClabeReason,
  ) {
    super(`Invalid CLABE <${value}>: ${reason}`);
    this.name = "InvalidClabeError";
  }
}
