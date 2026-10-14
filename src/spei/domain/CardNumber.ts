import { InvalidCardNumberError } from "./InvalidCardNumberError";

const CARD_LENGTH = 16;
const SEPARATORS = /[\s-]/g;
const ONLY_DIGITS = /^\d+$/;

export class CardNumber {
  private constructor(readonly value: string) {}

  static create(value: string): CardNumber {
    const normalized = value.replace(SEPARATORS, "");

    if (!ONLY_DIGITS.test(normalized)) {
      throw new InvalidCardNumberError(value, "non_numeric");
    }
    if (normalized.length !== CARD_LENGTH) {
      throw new InvalidCardNumberError(value, "length");
    }
    if (!CardNumber.passesLuhn(normalized)) {
      throw new InvalidCardNumberError(value, "checksum");
    }

    return new CardNumber(normalized);
  }

  formatted(): string {
    return this.value.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  private static passesLuhn(digits: string): boolean {
    const sum = [...digits].reverse().reduce((total, char, index) => {
      const digit = Number(char);
      if (index % 2 === 0) return total + digit;
      const doubled = digit * 2;
      return total + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);

    return sum % 10 === 0;
  }
}
