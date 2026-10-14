import { es } from "../../i18n/es";
import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { formatTransferText } from "./formatTransferText";

export type ShareResult = "shared" | "copied";

export type ShareCapableNavigator = {
  clipboard: Pick<Clipboard, "writeText">;
  share?: (data: ShareData) => Promise<void>;
};

export async function shareTransfer(
  data: SpeiTransferData,
  url: URL,
  shareNavigator: ShareCapableNavigator = navigator,
): Promise<ShareResult> {
  const text = formatTransferText(data);

  if (shareNavigator.share) {
    await shareNavigator.share({ title: es.share.text.title, text, url: url.toString() });
    return "shared";
  }

  await shareNavigator.clipboard.writeText(`${text}\n\n${url.toString()}`);
  return "copied";
}
