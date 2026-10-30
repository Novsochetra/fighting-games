export const API_CACHE = 'arcade-api';
const READS = ['api/games', 'api/supporters'];

// The games and the supporters come from the server while it answers, and the last answer stands
// in for it offline, so the arcade still lists them.
export async function apiNetworkFirst({ caches, fetch, request }) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const kept = await cache.match(request);

    if (kept) {
      return kept;
    }

    throw error;
  }
}

// The arcade's first visit read its games before the worker was there to keep them, so the worker
// reads them once as it comes in; offline, the arcade lists them from the start.
export async function keepApiReads({ caches, fetch, scope }) {
  const cache = await caches.open(API_CACHE);
  const reads = READS.map(async (path) => {
    const request = new Request(new URL(path, scope).href);
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response);
    }
  });

  await Promise.allSettled(reads);
}
