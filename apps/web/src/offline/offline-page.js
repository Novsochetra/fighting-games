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
  <p>This game has not been played here yet. Connect to the internet, then try again.</p>
  <a href="">Try again</a>
</html>
`;

// A page that is not kept, opened offline: a game not played here yet, or a page of the server.
export const offlineResponse = () =>
  new Response(OFFLINE_PAGE, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
