import { InvalidRfcError } from "./InvalidRfcError";

// 3 letters (persona moral) or 4 letters (persona física), birth/creation date YYMMDD and homoclave.
const RFC_FORMAT = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;

export class Rfc {
  private constructor(readonly value: string) {}

  static create(value: string): Rfc {
    const normalized = value.replace(/[\s-]/g, "").toUpperCase();

    if (!RFC_FORMAT.test(normalized)) {
      throw new InvalidRfcError(value, "format");
    }

    return new Rfc(normalized);
  }
}
