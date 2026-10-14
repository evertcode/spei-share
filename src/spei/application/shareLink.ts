import { Clabe } from "../domain/Clabe";
import type { SpeiTransferData } from "../domain/SpeiTransferData";
import { InvalidShareLinkError } from "./InvalidShareLinkError";

const SHARE_PATH = "/ver";
const DATA_PARAM = "d";

export function encodeShareLink(data: SpeiTransferData, baseUrl: URL): URL {
  const url = new URL(SHARE_PATH, baseUrl);
  const params = new URLSearchParams({ [DATA_PARAM]: toBase64Url(JSON.stringify(data)) });
  url.hash = params.toString();

  return url;
}

export function decodeShareLink(hash: string): SpeiTransferData {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get(DATA_PARAM);
  if (!encoded) {
    throw new InvalidShareLinkError(hash);
  }

  try {
    return toTransferData(JSON.parse(fromBase64Url(encoded)));
  } catch {
    throw new InvalidShareLinkError(hash);
  }
}

function toTransferData(payload: unknown): SpeiTransferData {
  if (!isRecord(payload) || !isRecord(payload.destination)) {
    throw new Error("Malformed payload");
  }

  const { beneficiaryName, destination } = payload;
  if (typeof beneficiaryName !== "string" || beneficiaryName.trim() === "") {
    throw new Error("Missing beneficiary name");
  }
  if (destination.type !== "clabe" || typeof destination.value !== "string") {
    throw new Error("Unsupported destination");
  }

  return {
    beneficiaryName: beneficiaryName.trim(),
    destination: { type: "clabe", value: Clabe.create(destination.value).value },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
