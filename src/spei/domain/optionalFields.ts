import { Amount } from "./Amount";
import { Concept } from "./Concept";
import { Email } from "./Email";
import { Rfc } from "./Rfc";
import type { OptionalField } from "./SpeiTransferData";

export const OPTIONAL_FIELDS: readonly OptionalField[] = ["concept", "amount", "rfc", "email"];

export function createOptionalField(field: OptionalField, value: string): string {
  switch (field) {
    case "concept":
      return Concept.create(value).value;
    case "amount":
      return Amount.create(value).value;
    case "rfc":
      return Rfc.create(value).value;
    case "email":
      return Email.create(value).value;
  }
}

export function formatOptionalField(field: OptionalField, value: string): string {
  return field === "amount" ? Amount.create(value).formatted() : value;
}
