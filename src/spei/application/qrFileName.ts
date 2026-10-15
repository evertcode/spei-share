import type { TransferDestination } from "../domain/SpeiTransferData";

const VISIBLE_DIGITS = 4;

export function qrFileName(destination: TransferDestination): string {
  return `spei-${destination.value.slice(-VISIBLE_DIGITS)}.svg`;
}
