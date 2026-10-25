import { createAppearance } from '../home/appearance.js';
import { wireBackLink } from '../home/back-link.js';
import { createMemoryStorage } from '../home/preferences.js';

export function bootCredits({ document, storage, history, referrer }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  // appearance-early.js picks light or dark before the first paint; this follows the device after it.
  createAppearance({ document, storage: storage ?? createMemoryStorage(), signal });
  wireBackLink({ link: document.getElementById('back'), history, referrer, signal });
  return { stop: () => lifetime.abort() };
}
