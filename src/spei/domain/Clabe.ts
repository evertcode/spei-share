import { InvalidClabeError } from "./InvalidClabeError";

const CLABE_LENGTH = 18;
const BANK_CODE_LENGTH = 3;
const CHECK_DIGIT_WEIGHTS = [3, 7, 1] as const;
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
    if (Clabe.checkDigitOf(normalized.slice(0, -1)) !== Number(normalized.at(-1))) {
      throw new InvalidClabeError(value, "check_digit");
    }

    return new Clabe(normalized);
  }

  get bankCode(): string {
    return this.value.slice(0, BANK_CODE_LENGTH);
  }

  formatted(): string {
    const v = this.value;
    return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 17)} ${v.slice(17)}`;
  }

  private static checkDigitOf(digits: string): number {
    const sum = [...digits].reduce(
      (total, digit, index) =>
        total + ((Number(digit) * CHECK_DIGIT_WEIGHTS[index % CHECK_DIGIT_WEIGHTS.length]) % 10),
      0,
    );

    return (10 - (sum % 10)) % 10;
  }
}
