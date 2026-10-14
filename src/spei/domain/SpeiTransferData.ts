export type DestinationType = "clabe" | "card" | "account";

export type TransferDestination = {
  type: DestinationType;
  value: string;
};

export type SpeiTransferData = {
  beneficiaryName: string;
  destination: TransferDestination;
  bankName?: string;
};
