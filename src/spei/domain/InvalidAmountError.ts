export type InvalidAmountReason = "format" | "not_positive";

export class InvalidAmountError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidAmountReason,
  ) {
    super(`Invalid amount <${value}>: ${reason}`);
    this.name = "InvalidAmountError";
  }
}
