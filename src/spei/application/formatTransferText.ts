import { es } from "../../i18n/es";
import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { formatOptionalField, OPTIONAL_FIELDS } from "../domain/optionalFields";
import { formatTransferDestination } from "../domain/transferDestination";
import { DESTINATION_LABELS } from "./transferLabels";

export function formatTransferText(data: SpeiTransferData): string {
  const lines = [es.share.text.title, `${es.view.beneficiaryName.label}: ${data.beneficiaryName}`];

  if (data.bankName) lines.push(`${es.view.bank.label}: ${data.bankName}`);
  lines.push(
    `${DESTINATION_LABELS[data.destination.type]}: ${formatTransferDestination(data.destination)}`,
  );

  for (const field of OPTIONAL_FIELDS) {
    const value = data[field];
    if (value) lines.push(`${es.view[field].label}: ${formatOptionalField(field, value)}`);
  }

  return lines.join("\n");
}
