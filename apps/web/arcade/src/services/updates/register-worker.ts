// The arcade's worker keeps it, and each game played here, for offline (src/service-worker/sw.js). It sits
// at the arcade's root, whichever screen the tab opened on; a browser that refuses it runs the arcade
// from the network as before.
export function registerWorker(window: Window, root: URL) {
  window.navigator.serviceWorker?.register(new URL('sw.js', root)).catch(() => null);
}
