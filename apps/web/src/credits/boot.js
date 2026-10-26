import { createAppearance } from '../home/appearance.js';
import { createMemoryStorage } from '../home/preferences.js';

// In the arcade the screens share the appearance; on its own the page makes its own.
export function bootCredits({ document, storage, shared = {} }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;

  // appearance-early.js picks light or dark before the first paint; this follows the device after it.
  if (!shared.appearance) {
    createAppearance({ document, storage: storage ?? createMemoryStorage(), signal });
  }

  return { stop: () => lifetime.abort() };
}
