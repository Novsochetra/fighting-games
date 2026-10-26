// A view transition with the root marked by its kind while it plays, so each kind's CSS (the light
// and dark cross-fade, a screen's slide) applies to it alone. A transition that starts over another
// skips it, so each takes off only its own mark. Without view transitions the change is made at once.
export function startMarkedTransition(document, kind, update) {
  if (typeof document.startViewTransition !== 'function') {
    update();
    return null;
  }

  const root = document.documentElement;
  root.dataset.transition = kind;
  const transition = document.startViewTransition(update);
  const unmark = () => {
    if (root.dataset.transition === kind) {
      delete root.dataset.transition;
    }
  };

  transition.finished.then(unmark, unmark);

  return transition;
}
