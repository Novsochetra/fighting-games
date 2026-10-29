const TAP_DISTANCE = 12;
const DOUBLE_TAP_MS = 350;

export function isQuickSecondTap({ distance, sinceLastTap }) {
  return distance < TAP_DISTANCE && sinceLastTap < DOUBLE_TAP_MS;
}

function clearSelection(window) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount) {
    selection.removeAllRanges();
  }
}

// iPhone Safari ignores user-scalable=no, so pinch zoom, double-tap zoom, long-press callouts and
// text selection are cancelled by hand: on the whole page, in `root` (the game's app) for the
// long-press menu, and for every touch on the `surfaces` played on (the stage, the touch controls)
export function installGestureGuards({ window, document, root, surfaces }) {
  const cancel = (event) => event.preventDefault();
  root.addEventListener('contextmenu', cancel);
  for (const type of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) {
    document.addEventListener(type, cancel, { passive: false });
  }
  document.addEventListener('selectstart', cancel);
  for (const element of surfaces) {
    element.addEventListener(
      'touchstart',
      (event) => {
        event.preventDefault();
        clearSelection(window);
      },
      { passive: false },
    );
  }
}

// a quick second tap on a menu button would zoom on iPhone, so it is swallowed and clicked here
export function installMenuTapFix(menus) {
  let lastTap = -1e9;
  let start = { x: 0, y: 0 };
  menus.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      start = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );
  menus.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches[0];
      const distance = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
      if (isQuickSecondTap({ distance, sinceLastTap: event.timeStamp - lastTap })) {
        event.preventDefault();
        event.target.closest('button')?.click();
      }
      if (distance < TAP_DISTANCE) {
        lastTap = event.timeStamp;
      }
    },
    { passive: false },
  );
}
