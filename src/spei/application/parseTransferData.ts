import { createOptionalField, OPTIONAL_FIELDS } from "../domain/optionalFields";
import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { createTransferDestination, isDestinationType } from "../domain/transferDestination";

// Validates untrusted payloads (share links, stored drafts) and returns normalized data.
// Throws when the payload is malformed or any field is invalid.
export function parseTransferData(payload: unknown): SpeiTransferData {
  if (!isRecord(payload) || !isRecord(payload.destination)) {
    throw new Error("Malformed payload");
  }

  const { beneficiaryName, destination, bankName } = payload;
  if (typeof beneficiaryName !== "string" || beneficiaryName.trim() === "") {
    throw new Error("Missing beneficiary name");
  }
  if (!isDestinationType(destination.type) || typeof destination.value !== "string") {
    throw new Error("Unsupported destination");
  }
  if (bankName !== undefined && typeof bankName !== "string") {
    throw new Error("Malformed bank name");
  }

  const trimmedBankName = bankName?.trim();
  if (destination.type !== "clabe" && !trimmedBankName) {
    throw new Error("Missing bank name");
  }

  const data: SpeiTransferData = {
    beneficiaryName: beneficiaryName.trim(),
    destination: createTransferDestination(destination.type, destination.value),
  };
  if (trimmedBankName) data.bankName = trimmedBankName;

  for (const field of OPTIONAL_FIELDS) {
    const value = payload[field];
    if (value === undefined) continue;
    if (typeof value !== "string") throw new Error(`Malformed ${field}`);
    if (value.trim() !== "") data[field] = createOptionalField(field, value);
  }

  return data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
