import { servedVersion } from './arcade-version.js';
import { takeNewestWorker } from './newest-worker.js';

// An arcade left open, or opened from what its worker keeps, runs the build it loaded, however many
// deploys come after it; an installed one on a phone may not load again for days. So it asks the
// server for its version as it opens and each time it is shown again, and once a newer build is all
// in, it is ready for the player to reload into. A page with no version (npm run dev) never asks.
export function createUpdateCheck({ version, fetch, root, workers, document, signal }) {
  const listeners = new Set();
  const state = { isReady: false, isChecking: false };

  async function check() {
    const served = await servedVersion(fetch, root);

    if (served && served !== version && (await takeNewestWorker(workers, root))) {
      state.isReady = true;
      listeners.forEach((listener) => listener());
    }
  }

  function look() {
    if (state.isReady || state.isChecking || document.visibilityState !== 'visible') {
      return;
    }

    state.isChecking = true;
    check().finally(() => {
      state.isChecking = false;
    });
  }

  if (version) {
    document.addEventListener('visibilitychange', look, { signal });
    look();
  }

  return {
    isReady: () => state.isReady,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}
