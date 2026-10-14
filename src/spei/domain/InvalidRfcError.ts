export type InvalidRfcReason = "format";

export class InvalidRfcError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidRfcReason,
  ) {
    super(`Invalid RFC <${value}>: ${reason}`);
    this.name = "InvalidRfcError";
  }
}
