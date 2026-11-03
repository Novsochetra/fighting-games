import { navItems, scopeOf } from './focus.js';
import { currentSection } from './show.js';

function focusUnder(app, target) {
  const item = target.closest?.('[data-nav]');
  const scope = scopeOf(currentSection(app));

  if (item && item !== item.ownerDocument.activeElement && navItems(scope).includes(item)) {
    item.focus({ preventScroll: true });
  }
}

// a mouse moving over a button or a row gives it the focus, so the one gold look is where the
// mouse is as well as where the keys and the pad left it. Only a move of the mouse itself counts:
// a list the keys scroll slides another item under a mouse lying still, and a browser may send a
// move for that, which must not take the focus back from the keys. A finger's drag scrolls a list
// and leaves the focus where it was
export function followPointer(app) {
  let last = null;

  app.root.addEventListener('pointermove', (event) => {
    const at = `${event.clientX},${event.clientY}`;
    const moved = at !== last;

    last = at;

    if (moved && event.pointerType !== 'touch') {
      focusUnder(app, event.target);
    }
  });
}
