export type TransferDestination = {
  type: "clabe";
  value: string;
};

export type SpeiTransferData = {
  beneficiaryName: string;
  destination: TransferDestination;
  bankName?: string;
};
