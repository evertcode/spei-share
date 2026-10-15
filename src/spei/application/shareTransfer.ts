import { es } from "../../i18n/es";
import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { formatShareText, formatTransferText } from "./formatTransferText";

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
  if (shareNavigator.share) {
    await shareNavigator.share({
      title: es.share.text.title,
      text: formatTransferText(data),
      url: url.toString(),
    });
    return "shared";
  }

  await shareNavigator.clipboard.writeText(formatShareText(data, url));
  return "copied";
}
