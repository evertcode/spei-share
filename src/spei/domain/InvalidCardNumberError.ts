export type InvalidCardNumberReason = "length" | "non_numeric" | "checksum";

export class InvalidCardNumberError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidCardNumberReason,
  ) {
    super(`Invalid card number: ${reason}`);
    this.name = "InvalidCardNumberError";
  }
}
