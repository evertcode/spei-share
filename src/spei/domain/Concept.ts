import { InvalidConceptError } from "./InvalidConceptError";

export const CONCEPT_MAX_LENGTH = 40;

export class Concept {
  private constructor(readonly value: string) {}

  static create(value: string): Concept {
    const trimmed = value.trim();

    if (trimmed.length > CONCEPT_MAX_LENGTH) {
      throw new InvalidConceptError(value, "too_long");
    }

    return new Concept(trimmed);
  }
}
