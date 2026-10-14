import QRCode from "qrcode";

export function generateQrSvg(url: URL): Promise<string> {
  return QRCode.toString(url.toString(), { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
