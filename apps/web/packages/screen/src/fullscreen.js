// full screen where the browser has it (Safari on iPhone has none), and the landscape lock some
// phones' browsers allow once in it; `lockLandscape()` says whether to try, as a game played with a
// keyboard has no reason to
export function createFullscreen({ document, screen, lockLandscape = () => false }) {
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const current = () => document.fullscreenElement || document.webkitFullscreenElement;

  function lock() {
    if (lockLandscape() && screen?.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  }

  function enter() {
    if (!request) {
      return;
    }
    try {
      const pending = request.call(root, { navigationUI: 'hide' });
      pending?.then?.(lock).catch(() => {});
    } catch {
      return;
    }
  }

  function toggle() {
    if (current()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      enter();
    }
  }

  return { supported: !!request, isActive: () => !!current(), enter, toggle };
}

// `changed` hears full screen come and go, by a button, F or the browser's own Escape
export function installFullscreen({ window, document, fullscreen, changed }) {
  document.addEventListener('fullscreenchange', changed);
  document.addEventListener('webkitfullscreenchange', changed);
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.code === 'KeyF' && !event.repeat && !event.ctrlKey && !event.metaKey) {
        fullscreen.toggle();
      }
    },
    true,
  );
}
