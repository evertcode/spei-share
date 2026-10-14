import { InvalidClabeError } from "./InvalidClabeError";

const CLABE_LENGTH = 18;
const SEPARATORS = /[\s-]/g;
const ONLY_DIGITS = /^\d+$/;

export class Clabe {
  private constructor(readonly value: string) {}

  static create(value: string): Clabe {
    const normalized = value.replace(SEPARATORS, "");

    if (!ONLY_DIGITS.test(normalized)) {
      throw new InvalidClabeError(value, "non_numeric");
    }
    if (normalized.length !== CLABE_LENGTH) {
      throw new InvalidClabeError(value, "length");
    }

    return new Clabe(normalized);
  }

  formatted(): string {
    const v = this.value;
    return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 17)} ${v.slice(17)}`;
  }
}
