import { AccountNumber } from "./AccountNumber";
import { CardNumber } from "./CardNumber";
import { Clabe } from "./Clabe";
import type { DestinationType, TransferDestination } from "./SpeiTransferData";

const DESTINATION_TYPES: readonly DestinationType[] = ["clabe", "card", "account"];

export function isDestinationType(value: unknown): value is DestinationType {
  return DESTINATION_TYPES.includes(value as DestinationType);
}

export function createTransferDestination(
  type: DestinationType,
  value: string,
): TransferDestination {
  switch (type) {
    case "clabe":
      return { type, value: Clabe.create(value).value };
    case "card":
      return { type, value: CardNumber.create(value).value };
    case "account":
      return { type, value: AccountNumber.create(value).value };
  }
}

export function formatTransferDestination(destination: TransferDestination): string {
  switch (destination.type) {
    case "clabe":
      return Clabe.create(destination.value).formatted();
    case "card":
      return CardNumber.create(destination.value).formatted();
    case "account":
      return AccountNumber.create(destination.value).value;
  }
}
