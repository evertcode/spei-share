import { InvalidAmountError } from "./InvalidAmountError";

const IGNORED_CHARACTERS = /[\s,$]/g;
const DECIMAL_WITH_MAX_TWO_DIGITS = /^\d+(\.\d{1,2})?$/;
const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export class Amount {
  private constructor(readonly value: string) {}

  static create(value: string): Amount {
    const normalized = value.replace(IGNORED_CHARACTERS, "");

    if (!DECIMAL_WITH_MAX_TWO_DIGITS.test(normalized)) {
      throw new InvalidAmountError(value, "format");
    }
    const amount = Number(normalized);
    if (amount <= 0) {
      throw new InvalidAmountError(value, "not_positive");
    }

    return new Amount(amount.toFixed(2));
  }

  formatted(): string {
    return `${MXN_FORMATTER.format(Number(this.value))} MXN`;
  }
}
