import { vi } from 'vitest';

export const DAY_MS = 24 * 60 * 60 * 1000;

// The browser as the install banner sees it: where its events come from, whether it is an iPhone
// or the installed app already, and a clock the test moves by hand.
export function createFakeInstaller({ isIos = false, isInstalled = false, time = 1_000_000 } = {}) {
  const clock = { time };
  return {
    events: new EventTarget(),
    isIos,
    isInstalled: () => isInstalled,
    registerWorker: vi.fn(async () => null),
    now: () => clock.time,
    clock,
  };
}

// What Chrome fires once the page can be installed; prompt() opens its own install dialog.
export function offerInstall(installer, outcome = 'accepted') {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  event.prompt = vi.fn(async () => {});
  event.userChoice = Promise.resolve({ outcome, platform: 'web' });
  installer.events.dispatchEvent(event);
  return event;
}
