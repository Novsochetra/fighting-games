const FRESH = 'fresh';

// a module that fails to load stops the game before it starts, and the loading screen would wait at
// 97% for good. After a deploy that can be a stale cached copy lacking an export a newer module
// needs, so the page is fetched once more under a fresh address, and the new page names every
// module's current version. The address marks the retry, so a real bug cannot reload it in a loop,
// even where storage is blocked
export function watchBoot(window) {
  const retry = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has(FRESH)) {
      return;
    }
    url.searchParams.set(FRESH, String(Date.now()));
    window.location.replace(url.href);
  };
  window.addEventListener('error', retry);
  return {
    started() {
      window.removeEventListener('error', retry);
      const url = new URL(window.location.href);
      if (url.searchParams.has(FRESH)) {
        url.searchParams.delete(FRESH);
        window.history.replaceState(window.history.state, '', url.href);
      }
    },
  };
}
