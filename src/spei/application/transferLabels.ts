import { es } from "../../i18n/es";
import type { DestinationType } from "../domain/SpeiTransferData";

export const DESTINATION_LABELS: Record<DestinationType, string> = {
  clabe: es.view.clabe.label,
  card: es.view.card.label,
  account: es.view.account.label,
};
