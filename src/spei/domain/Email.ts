import { InvalidEmailError } from "./InvalidEmailError";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(value: string): Email {
    const trimmed = value.trim();

    if (!EMAIL_FORMAT.test(trimmed)) {
      throw new InvalidEmailError(value, "format");
    }

    return new Email(trimmed);
  }
}
