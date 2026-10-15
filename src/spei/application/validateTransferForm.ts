import { es } from "../../i18n/es";
import { AccountNumber } from "../domain/AccountNumber";
import { Amount } from "../domain/Amount";
import { CardNumber } from "../domain/CardNumber";
import { Clabe } from "../domain/Clabe";
import { findBankByCode } from "../domain/banks";
import { InvalidAccountNumberError } from "../domain/InvalidAccountNumberError";
import { InvalidAmountError } from "../domain/InvalidAmountError";
import { InvalidCardNumberError } from "../domain/InvalidCardNumberError";
import { InvalidClabeError } from "../domain/InvalidClabeError";
import { InvalidConceptError } from "../domain/InvalidConceptError";
import { InvalidEmailError } from "../domain/InvalidEmailError";
import { InvalidRfcError } from "../domain/InvalidRfcError";
import { createOptionalField, OPTIONAL_FIELDS } from "../domain/optionalFields";
import { Rfc } from "../domain/Rfc";
import type {
  DestinationType,
  OptionalField,
  OptionalTransferFields,
  SpeiTransferData,
} from "../domain/SpeiTransferData";
import { createTransferDestination } from "../domain/transferDestination";

export type TransferFormField = "beneficiaryName" | DestinationType | "bankName" | OptionalField;

export type TransferFormValues = { destinationType: DestinationType } & Record<
  TransferFormField,
  string
>;

export type TransferFormErrors = Partial<Record<TransferFormField, string>>;

export type TransferFormResult =
  { ok: true; data: SpeiTransferData } | { ok: false; errors: TransferFormErrors };

export const TRANSFER_FORM_FIELDS: readonly TransferFormField[] = [
  "beneficiaryName",
  "clabe",
  "card",
  "account",
  "bankName",
  ...OPTIONAL_FIELDS,
];

const DESTINATION_FIELDS: readonly TransferFormField[] = ["clabe", "card", "account"];

const CLABE_ERRORS: Record<InvalidClabeError["reason"], string> = {
  length: es.errors.clabe.length,
  non_numeric: es.errors.clabe.nonNumeric,
  check_digit: es.errors.clabe.checkDigit,
};
const CARD_ERRORS: Record<InvalidCardNumberError["reason"], string> = {
  length: es.errors.card.length,
  non_numeric: es.errors.nonNumeric,
  checksum: es.errors.card.checksum,
};
const ACCOUNT_ERRORS: Record<InvalidAccountNumberError["reason"], string> = {
  length: es.errors.account.length,
  non_numeric: es.errors.nonNumeric,
};
const AMOUNT_DISPLAY = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function emptyTransferFormValues(): TransferFormValues {
  return {
    destinationType: "clabe",
    beneficiaryName: "",
    clabe: "",
    card: "",
    account: "",
    bankName: "",
    concept: "",
    amount: "",
    rfc: "",
    email: "",
  };
}

// Fields that take part in the current form state (hidden destination fields are ignored).
export function isActiveField(field: TransferFormField, values: TransferFormValues): boolean {
  if (DESTINATION_FIELDS.includes(field)) return field === values.destinationType;
  if (field === "bankName") return values.destinationType !== "clabe";
  return true;
}

export function validateTransferField(
  field: TransferFormField,
  values: TransferFormValues,
): string | undefined {
  if (!isActiveField(field, values)) return undefined;

  const value = values[field].trim();
  const isOptional = (OPTIONAL_FIELDS as readonly string[]).includes(field);
  if (value === "") return isOptional ? undefined : es.errors.required;

  try {
    if (field === "clabe" || field === "card" || field === "account") {
      createTransferDestination(field, value);
    } else if (field !== "beneficiaryName" && field !== "bankName") {
      createOptionalField(field, value);
    }
    return undefined;
  } catch (error) {
    return errorMessageFor(error);
  }
}

export function validateTransferForm(values: TransferFormValues): TransferFormResult {
  const errors: TransferFormErrors = {};
  for (const field of TRANSFER_FORM_FIELDS) {
    const message = validateTransferField(field, values);
    if (message) errors[field] = message;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const type = values.destinationType;
  const destination = createTransferDestination(type, values[type].trim());
  const optionalFields: OptionalTransferFields = {};
  for (const field of OPTIONAL_FIELDS) {
    const value = values[field].trim();
    if (value !== "") optionalFields[field] = createOptionalField(field, value);
  }

  const bankName =
    type === "clabe"
      ? findBankByCode(Clabe.create(destination.value).bankCode)?.name
      : values.bankName.trim();
  const data: SpeiTransferData = {
    beneficiaryName: values.beneficiaryName.trim(),
    destination,
    ...optionalFields,
  };
  if (bankName) data.bankName = bankName;

  return { ok: true, data };
}

// Display formatting applied when leaving a field. Invalid values are returned unchanged.
export function formatTransferField(field: TransferFormField, value: string): string {
  try {
    switch (field) {
      case "clabe":
        return Clabe.create(value).formatted();
      case "card":
        return CardNumber.create(value).formatted();
      case "account":
        return AccountNumber.create(value).value;
      case "amount":
        return AMOUNT_DISPLAY.format(Number(Amount.create(value).value));
      case "rfc":
        return Rfc.create(value).value;
      default:
        return value;
    }
  } catch {
    return value;
  }
}

function errorMessageFor(error: unknown): string {
  if (error instanceof InvalidClabeError) return CLABE_ERRORS[error.reason];
  if (error instanceof InvalidCardNumberError) return CARD_ERRORS[error.reason];
  if (error instanceof InvalidAccountNumberError) return ACCOUNT_ERRORS[error.reason];
  if (error instanceof InvalidConceptError) return es.errors.concept.tooLong;
  if (error instanceof InvalidAmountError) return es.errors.amount.invalid;
  if (error instanceof InvalidRfcError) return es.errors.rfc.invalid;
  if (error instanceof InvalidEmailError) return es.errors.email.invalid;
  throw error;
}
