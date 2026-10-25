import { vi } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '../../src/home/preferences.js';

// The live site's analytics with Google's tag swapped for one that only records what it was given.
export function createFakeAnalytics() {
  const tag = { event: vi.fn(), grant: vi.fn(), deny: vi.fn() };
  const loadTag = vi.fn(() => tag);
  return { tag, loadTag, setup: { isEnabled: true, loadTag } };
}

export function storageWithConsent(choice) {
  const storage = createMemoryStorage();
  storage.write(STORAGE_KEYS.analyticsConsent, choice);
  return storage;
}

export const sentEvents = (tag) => tag.event.mock.calls.map(([name, params]) => [name, params]);

export const clearBannerClasses = () =>
  document.documentElement.classList.remove(
    'has-consent-banner',
    'has-install-banner',
    'has-support-banner',
  );
