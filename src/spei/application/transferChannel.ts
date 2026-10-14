import type { SpeiTransferData } from "../domain/SpeiTransferData";

export type SharedTransfer = {
  data: SpeiTransferData;
  url: URL;
};

type Listener = (transfer: SharedTransfer | null) => void;

// Lets page scripts (form, card) hand the current transfer to the share actions,
// replaying the latest value so script execution order does not matter.
const listeners = new Set<Listener>();
let latest: SharedTransfer | null = null;

export function publishTransfer(transfer: SharedTransfer | null): void {
  latest = transfer;
  for (const listener of listeners) listener(transfer);
}

export function subscribeToTransfer(listener: Listener): () => void {
  listeners.add(listener);
  listener(latest);

  return () => listeners.delete(listener);
}
