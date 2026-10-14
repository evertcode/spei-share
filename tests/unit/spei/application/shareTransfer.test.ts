import { describe, expect, it, vi } from "vitest";
import {
  shareTransfer,
  type ShareCapableNavigator,
} from "../../../../src/spei/application/shareTransfer";
import type { SpeiTransferData } from "../../../../src/spei/domain/SpeiTransferData";

const DATA: SpeiTransferData = {
  beneficiaryName: "Ada Lovelace",
  bankName: "BBVA México",
  destination: { type: "clabe", value: "012180001234567899" },
};
const URL_TO_SHARE = new URL("https://spei.example/ver#d=abc");

function fakeNavigator(withShare: boolean): ShareCapableNavigator & {
  clipboard: { writeText: ReturnType<typeof vi.fn> };
  share?: ReturnType<typeof vi.fn>;
} {
  return {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    ...(withShare ? { share: vi.fn().mockResolvedValue(undefined) } : {}),
  };
}

describe("shareTransfer", () => {
  it("uses the native share when available", async () => {
    const nav = fakeNavigator(true);

    const result = await shareTransfer(DATA, URL_TO_SHARE, nav);

    expect(result).toBe("shared");
    expect(nav.share).toHaveBeenCalledWith({
      title: "Datos para transferencia SPEI",
      text: expect.stringContaining("Beneficiario: Ada Lovelace"),
      url: URL_TO_SHARE.toString(),
    });
    expect(nav.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("falls back to clipboard when native share is not available", async () => {
    const nav = fakeNavigator(false);

    const result = await shareTransfer(DATA, URL_TO_SHARE, nav);

    expect(result).toBe("copied");
    expect(nav.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/CLABE: 012 180 00123456789 9\n\nhttps:\/\/spei\.example\/ver#d=abc$/),
    );
  });
});
