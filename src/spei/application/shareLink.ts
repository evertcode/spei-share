import { createTransferDestination, isDestinationType } from "../domain/transferDestination";
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

  const { beneficiaryName, destination, bankName } = payload;
  if (typeof beneficiaryName !== "string" || beneficiaryName.trim() === "") {
    throw new Error("Missing beneficiary name");
  }
  if (!isDestinationType(destination.type) || typeof destination.value !== "string") {
    throw new Error("Unsupported destination");
  }
  if (bankName !== undefined && typeof bankName !== "string") {
    throw new Error("Malformed bank name");
  }

  const trimmedBankName = bankName?.trim();
  if (destination.type !== "clabe" && !trimmedBankName) {
    throw new Error("Missing bank name");
  }

  const data: SpeiTransferData = {
    beneficiaryName: beneficiaryName.trim(),
    destination: createTransferDestination(destination.type, destination.value),
  };
  if (trimmedBankName) data.bankName = trimmedBankName;

  return data;
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
