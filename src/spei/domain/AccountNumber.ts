import { InvalidAccountNumberError } from "./InvalidAccountNumberError";

const VALID_LENGTHS: readonly number[] = [10, 11];
const SEPARATORS = /[\s-]/g;
const ONLY_DIGITS = /^\d+$/;

export class AccountNumber {
  private constructor(readonly value: string) {}

  static create(value: string): AccountNumber {
    const normalized = value.replace(SEPARATORS, "");

    if (!ONLY_DIGITS.test(normalized)) {
      throw new InvalidAccountNumberError(value, "non_numeric");
    }
    if (!VALID_LENGTHS.includes(normalized.length)) {
      throw new InvalidAccountNumberError(value, "length");
    }

    return new AccountNumber(normalized);
  }
}
