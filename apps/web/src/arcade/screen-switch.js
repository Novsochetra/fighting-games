import { startMarkedTransition } from '../home/marked-transition.js';

function applyHead(document, { title, description, canonical }) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);

  if (canonical) {
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  }
}

// A sheet or popover left open on the screen being left would stay in the top layer over the next
// one, and an open sheet holds the page still (sheet.js), so both close as it goes, sliding with it.
function closeOverlays(screen) {
  for (const dialog of screen.root.querySelectorAll('dialog[open]')) {
    dialog.close();
  }

  for (const popover of screen.root.querySelectorAll('[popover]')) {
    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  }
}

// The screen left stays in the document, inert, so the arcade comes back as it was left; focus goes
// to the screen arrived at, as a page load would put it.
function show(document, { from, to, scrollY }) {
  closeOverlays(from);
  from.root.toggleAttribute('inert', true);
  to.root.toggleAttribute('inert', false);
  applyHead(document, to.head);
  document.defaultView.scrollTo(0, scrollY);
  to.root.focus({ preventScroll: true });
}

// A push slides the screen arrived at in over the one left, a pop slides the one left off it
// (screens.css), as an iOS navigation stack does; a swipe the browser already played needs neither.
export function switchScreen(document, { from, to, direction, scrollY, animate }) {
  const update = () => show(document, { from, to, scrollY });

  if (!animate) {
    update();
    return Promise.resolve();
  }

  const transition = startMarkedTransition(document, direction, update);

  return transition ? transition.updateCallbackDone.catch(() => {}) : Promise.resolve();
}
