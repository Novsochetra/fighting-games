// The arcade keeps this game for offline: its worker downloads all of it behind the first play and
// answers this address, in the game's own folder, with how far that is. Outside the arcade
// (npm run dev, a browser with no worker) nothing answers it, and nothing waits.
export const OFFLINE_PROGRESS = '.offline-progress';
const ASK_EVERY_MS = 250;

// the share of the game kept, and whether the loading screen still waits for the rest; a download
// that failed leaves the game to play from the network, as it did before the arcade kept games
export function offlineShare(answer) {
  if (!answer || answer.ready || answer.failed) {
    return { waiting: false, share: 1 };
  }

  return { waiting: true, share: answer.total > 0 ? Math.min(1, answer.done / answer.total) : 0 };
}

// true once no file has come in for stallMs, so a download that hangs never holds the game
export function hasStalled(stall, done, now, stallMs) {
  if (done !== stall.done) {
    Object.assign(stall, { done, since: now });
  }

  return now - stall.since >= stallMs;
}

async function askWorker(fetch) {
  try {
    const response = await fetch(OFFLINE_PROGRESS, { cache: 'no-store' });

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

// settles once all of the game is kept, or nothing keeps it, or its download fails or stalls
export function waitForOffline({ fetch, setTimer, now, onProgress, stallMs }) {
  if (typeof fetch !== 'function') {
    onProgress(1);

    return Promise.resolve();
  }

  const stall = { done: null, since: now() };

  return new Promise((resolve) => {
    const ask = async () => {
      const answer = await askWorker(fetch);
      const { waiting, share } = offlineShare(answer);

      onProgress(share);

      if (waiting && !hasStalled(stall, answer.done, now(), stallMs)) {
        setTimer(ask, ASK_EVERY_MS);
      } else {
        resolve();
      }
    };

    ask();
  });
}
