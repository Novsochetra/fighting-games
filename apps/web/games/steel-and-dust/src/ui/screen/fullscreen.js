import {
  createFullscreen as createPageFullscreen,
  installFullscreen as installPageFullscreen,
} from '../../../../../packages/screen/src/fullscreen.js';

// phones lock to landscape in full screen where the browser allows it, and the menus' full screen
// buttons ([data-fs]) say which way they go, or hide where there is none
export function createFullscreen({ document, screen, ui }) {
  const fullscreen = createPageFullscreen({ document, screen, lockLandscape: ui.isTouchOn });

  function refreshLabels() {
    for (const button of document.querySelectorAll('[data-fs]')) {
      button.hidden = !fullscreen.supported;
      button.textContent = fullscreen.isActive() ? 'Exit full screen' : 'Full screen';
    }
  }

  return { ...fullscreen, refreshLabels };
}

// the page fits itself again once the browser has settled into full screen or out of it
export function installFullscreen({ window, document, fullscreen, layout }) {
  installPageFullscreen({
    window,
    document,
    fullscreen,
    changed: () => {
      fullscreen.refreshLabels();
      window.setTimeout(layout.fit, 60);
    },
  });
}
