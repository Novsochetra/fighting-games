// At the arcade's root, whichever screen the tab opened on; a browser that refuses the worker runs
// the arcade from the network as before.
export function registerWorker(window: Window, root: URL) {
  window.navigator.serviceWorker?.register(new URL('sw.js', root)).catch(() => null);
}
