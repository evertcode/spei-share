export type InvalidAccountNumberReason = "length" | "non_numeric";

export class InvalidAccountNumberError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidAccountNumberReason,
  ) {
    super(`Invalid account number <${value}>: ${reason}`);
    this.name = "InvalidAccountNumberError";
  }
}
