export type InvalidConceptReason = "too_long";

export class InvalidConceptError extends Error {
  constructor(
    readonly value: string,
    readonly reason: InvalidConceptReason,
  ) {
    super(`Invalid concept: ${reason}`);
    this.name = "InvalidConceptError";
  }
}
