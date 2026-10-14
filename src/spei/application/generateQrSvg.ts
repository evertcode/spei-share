import QRCode from "qrcode";

// Fixed ink on paper colors: the SVG is also downloaded, so it must stay scannable outside the page theme.
const QR_COLORS = { dark: "#1c1a17", light: "#fbf8f2" } as const;

export function generateQrSvg(url: URL): Promise<string> {
  return QRCode.toString(url.toString(), {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: QR_COLORS,
  });
}
