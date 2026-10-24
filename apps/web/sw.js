// Chrome offers to install the arcade only once a service worker with a fetch handler controls it.
// This one adds nothing else: a page still loads from the network, and only when that fails, as on
// a device that is offline, does it answer with a short page that says so. It caches nothing, so a
// deploy is never hidden behind an old copy.
const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offline · Retro Arcade</title>
  <style>
    body {
      display: grid;
      place-content: center;
      gap: 0.75rem;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      font: 17px/1.3 -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      text-align: center;
      color: white;
      background: black;
    }
    h1 { margin: 0; font-size: 1.75rem; }
    p { margin: 0; color: rgb(255 255 255 / 72%); }
    a { justify-self: center; margin-top: 0.75rem; padding: 0.9rem 1.5rem; border-radius: 999px;
      font-weight: 600; color: black; background: white; text-decoration: none; }
  </style>
  <h1>You are offline</h1>
  <p>Connect to the internet, then try again.</p>
  <a href="">Try again</a>
</html>
`;

// A game loads hundreds of files. Chrome's static routing sends them straight to the network, so
// the worker never wakes up for them and a game runs as if it were not here.
function gamesRoute(scope) {
  const pathname = `${new URL('games/', scope).pathname}*`;
  return { condition: { urlPattern: new URLPattern({ pathname }) }, source: 'network' };
}

function offlineResponse() {
  return new Response(OFFLINE_PAGE, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  if (event.addRoutes) {
    // A browser that turns the route down still gets a working worker: the fetch handler below
    // lets every file that is not a page load through untouched.
    event.waitUntil(event.addRoutes(gamesRoute(self.registration.scope)).catch(() => {}));
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(offlineResponse));
  }
});
