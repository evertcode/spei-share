export const ANNOUNCER_ID = "announcer";

const ANNOUNCE_DELAY_MS = 50;

// Writes into the visually hidden live region rendered by BaseLayout. The region is cleared
// first so repeating the same message is announced again.
export function announce(message: string, root: Document = document): void {
  const region = root.getElementById(ANNOUNCER_ID);
  if (!region) return;

  region.textContent = "";
  setTimeout(() => {
    region.textContent = message;
  }, ANNOUNCE_DELAY_MS);
}
