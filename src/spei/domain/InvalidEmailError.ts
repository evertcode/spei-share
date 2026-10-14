export type InvalidEmailReason = "format";

export class InvalidEmailError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidEmailReason,
  ) {
    super(`Invalid email <${value}>: ${reason}`);
    this.name = "InvalidEmailError";
  }
}
