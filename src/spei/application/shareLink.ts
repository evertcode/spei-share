import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { InvalidShareLinkError } from "./InvalidShareLinkError";
import { parseTransferData } from "./parseTransferData";

const SHARE_PATH = "/ver";
const DATA_PARAM = "d";

export function encodeShareLink(data: SpeiTransferData, baseUrl: URL): URL {
  const url = new URL(SHARE_PATH, baseUrl);
  const params = new URLSearchParams({
    [DATA_PARAM]: toBase64Url(JSON.stringify(withoutEmptyFields(data))),
  });
  url.hash = params.toString();

  return url;
}

export function decodeShareLink(hash: string): SpeiTransferData {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get(DATA_PARAM);
  if (!encoded) {
    throw new InvalidShareLinkError(hash);
  }

  try {
    return parseTransferData(JSON.parse(fromBase64Url(encoded)));
  } catch {
    throw new InvalidShareLinkError(hash);
  }
}

function withoutEmptyFields(data: SpeiTransferData): SpeiTransferData {
  const { concept, amount, rfc, email, ...required } = data;
  const optionalFields = Object.entries({ concept, amount, rfc, email }).filter(([, value]) =>
    value?.trim(),
  );

  return { ...required, ...Object.fromEntries(optionalFields) };
}

function toBase64Url(text: string): string {
  const binary = Array.from(new TextEncoder().encode(text), (byte) =>
    String.fromCharCode(byte),
  ).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
