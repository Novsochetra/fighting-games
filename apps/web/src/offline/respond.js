import { apiNetworkFirst } from './api-cache.js';
import { fromArcade } from './arcade-cache.js';
import { downloadGame, fromGame } from './game-cache.js';
import { offlineResponse } from './offline-page.js';
import { routeOf } from './routes.js';

async function fromArcadeOrNetwork(context, key) {
  const kept = await fromArcade({ ...context, key });

  return kept ?? context.fetch(context.request);
}

// A game downloaded whole plays from its download, its pages and files all of one revision; until
// then it comes from the network, as it always did. Its card art is kept with the arcade's files
// (catalog-art.js), so the arcade shows it offline before the game is ever played.
async function fromGameOrNetwork(context, { id, key }) {
  const kept = (await fromGame({ ...context, id })) ?? (await fromArcade({ ...context, key }));

  if (kept) {
    return kept;
  }

  try {
    return await context.fetch(context.request);
  } catch (error) {
    if (context.request.mode === 'navigate') {
      return offlineResponse();
    }

    throw error;
  }
}

// The arcade prefetches a game's page as a player points at it (speculation rules); only opening it
// is a play.
const isPrefetch = (request) => request.headers?.get('Sec-Purpose')?.includes('prefetch') ?? false;

// Opening a game is its first play: the whole game comes down behind it, or its new revision after
// a deploy, while it plays from what it had.
function startGame(event, context, route) {
  if (context.request.mode === 'navigate' && !isPrefetch(context.request)) {
    event.waitUntil(downloadGame({ ...context, id: route.id }).catch(() => {}));
  }

  return fromGameOrNetwork(context, route);
}

// The response the worker gives a request, or null for one it leaves to the browser.
export function respondTo(event, services) {
  const context = { ...services, request: event.request };
  const route = routeOf(event.request, services.scope);

  switch (route.kind) {
    case 'page':
      return fromArcadeOrNetwork(context, route.key).catch(offlineResponse);
    case 'file':
      return fromArcadeOrNetwork(context, route.key);
    case 'api':
      return apiNetworkFirst(context);
    case 'game':
      return startGame(event, context, route);
    case 'navigate':
      return context.fetch(event.request).catch(offlineResponse);
    default:
      return null;
  }
}
