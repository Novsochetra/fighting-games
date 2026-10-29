const FRESH = 'fresh';
// a few tries ride out a connection that drops more than once, and a real bug still cannot reload
// the page in a loop, even where storage is blocked
const MAX_TRIES = 3;
// a file that never answers raises no error at all; a slow phone network still brings one of the
// game's files in every second or so, so this long with none is a load that has stopped
export const STALL_MS = 15000;
// a reload straight after a failure met the same trouble again (the arcade's worker still busy
// with the page that failed), so each try waits this much longer than the one before
export const RETRY_AFTER_MS = 1000;

// an exception as a module links or runs reaches the window itself, but a module that fails to come
// down (a dropped connection, a phone that slept mid-load) fires at its own <script> and never
// bubbles, so the window listens on the way down to it. An image or a font that fails is no reason
// to reload: the loading screen goes on without it
const stopsTheGame = ({ target }) => !target?.localName || target.localName === 'script';

// a module that fails to load stops the game before it starts, and the loading screen would wait at
// 97% for good. After a deploy that can be a stale cached copy lacking an export a newer module
// needs, so the page is fetched once more under a fresh address, and the new page names every
// module's current version. The address counts the tries
function createRetry(window) {
  let timer = null;

  return {
    now() {
      const url = new URL(window.location.href);
      const tries = Number(url.searchParams.get(FRESH) ?? 0);

      if (timer !== null || tries >= MAX_TRIES) {
        return;
      }

      url.searchParams.set(FRESH, String(tries + 1));
      const reload = () => window.location.replace(url.href);
      timer = window.setTimeout(reload, RETRY_AFTER_MS * (tries + 1));
    },

    cancel: () => window.clearTimeout(timer),
  };
}

function watchStall(window, retry) {
  if (typeof window.PerformanceObserver !== 'function') {
    return () => {};
  }

  let timer = window.setTimeout(retry, STALL_MS);
  const observer = new window.PerformanceObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(retry, STALL_MS);
  });

  observer.observe({ type: 'resource' });

  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
  };
}

export function watchBoot(window) {
  const retry = createRetry(window);
  const onError = (event) => stopsTheGame(event) && retry.now();
  const stopWatchingStall = watchStall(window, retry.now);

  window.addEventListener('error', onError, true);

  return {
    started() {
      window.removeEventListener('error', onError, true);
      stopWatchingStall();
      retry.cancel();
      const url = new URL(window.location.href);
      if (url.searchParams.has(FRESH)) {
        url.searchParams.delete(FRESH);
        window.history.replaceState(window.history.state, '', url.href);
      }
    },
  };
}
