export class InvalidShareLinkError extends Error {
  constructor(readonly hash: string) {
    super("Invalid share link");
    this.name = "InvalidShareLinkError";
  }
}
