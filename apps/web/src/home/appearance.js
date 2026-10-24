import { readToken } from './motion-tokens.js';

export const APPEARANCE_KEY = 'arcade.appearance';
const LIGHT_QUERY = '(prefers-color-scheme: light)';
const APPEARANCES = ['light', 'dark'];

export const systemAppearance = (window) =>
  window.matchMedia?.(LIGHT_QUERY).matches ? 'light' : 'dark';

// The visitor's switch holds while the device keeps the appearance it had when they flipped it; once
// the device changes (at sunset, say), the arcade follows the device again.
export function resolveAppearance(saved, system) {
  const isKept = Boolean(saved) && saved.system === system && APPEARANCES.includes(saved.choice);
  return isKept ? saved.choice : system;
}

function apply(document, appearance) {
  document.documentElement.dataset.appearance = appearance;
  const themeColor = readToken(document, '--color-launcher-background');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
}

// The whole page cross-fades between the two, where the browser can.
function applySmoothly(document, appearance, { smooth }) {
  if (smooth && typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => apply(document, appearance));
  } else {
    apply(document, appearance);
  }
}

export function createAppearance({ document, storage, signal }) {
  const window = document.defaultView;
  const current = () => document.documentElement.dataset.appearance;
  apply(document, resolveAppearance(storage.read(APPEARANCE_KEY), systemAppearance(window)));

  function toggle({ smooth = true } = {}) {
    const next = current() === 'light' ? 'dark' : 'light';
    const system = systemAppearance(window);
    storage.write(APPEARANCE_KEY, next === system ? null : { choice: next, system });
    applySmoothly(document, next, { smooth });
    return next;
  }

  window.matchMedia?.(LIGHT_QUERY).addEventListener?.(
    'change',
    () => {
      storage.write(APPEARANCE_KEY, null);
      applySmoothly(document, systemAppearance(window), { smooth: true });
    },
    { signal },
  );

  return { current, toggle };
}
