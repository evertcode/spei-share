export type DestinationType = "clabe" | "card" | "account";

export type TransferDestination = {
  type: DestinationType;
  value: string;
};

export type OptionalField = "concept" | "amount" | "rfc" | "email";

export type OptionalTransferFields = Partial<Record<OptionalField, string>>;

export type SpeiTransferData = {
  beneficiaryName: string;
  destination: TransferDestination;
  bankName?: string;
} & OptionalTransferFields;
