export function createFullscreen({ document, screen, ui }) {
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const current = () => document.fullscreenElement || document.webkitFullscreenElement;

  // phones also lock to landscape where the browser allows it
  function lockLandscape() {
    if (ui.isTouchOn() && screen?.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  }

  function enter() {
    if (!request) {
      return;
    }
    try {
      const pending = request.call(root, { navigationUI: 'hide' });
      pending?.then?.(lockLandscape).catch(() => {});
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

  function refreshLabels() {
    for (const button of document.querySelectorAll('[data-fs]')) {
      button.hidden = !request;
      button.textContent = current() ? 'Exit full screen' : 'Full screen';
    }
  }

  return { supported: !!request, isActive: () => !!current(), enter, toggle, refreshLabels };
}

export function installFullscreen({ window, document, fullscreen, layout }) {
  const changed = () => {
    fullscreen.refreshLabels();
    window.setTimeout(layout.fit, 60);
  };
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
