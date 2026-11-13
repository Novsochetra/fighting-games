export const API_CACHE = 'arcade-api';
const READS = ['api/games', 'api/supporters'];
// long enough for a phone's slow connection to answer, short of a screen that seems stuck
export const NETWORK_LIMIT_MS = 3000;

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const lastAnswer = async ({ caches, request }) => (await caches.open(API_CACHE)).match(request);

// The network's answer is kept even once the page has been given the last one in its place, so
// the next read has it.
function readAndKeep(event, { caches, fetch, request }) {
  const reading = (async () => {
    const response = await fetch(request);

    if (response.ok) {
      await (await caches.open(API_CACHE)).put(request, response.clone());
    }

    return response;
  })();

  event.waitUntil(reading.catch(() => {}));

  return reading;
}

// The games change only with a deploy, whose worker reads them again as it comes in, so the last
// answer shows at once, on a network however slow, and the network's is for the next visit.
export async function apiKeptFirst(event, context) {
  const reading = readAndKeep(event, context);

  return (await lastAnswer(context)) ?? reading;
}

// The supporters and the boards change with each gift and score, so the network's answer comes
// first while it comes in time; past the limit, or offline, the last answer stands in.
export async function apiNetworkFirst(event, context) {
  const reading = readAndKeep(event, context);
  const kept = await lastAnswer(context);

  if (!kept) {
    return reading;
  }

  const late = pause(NETWORK_LIMIT_MS).then(() => kept);

  return Promise.race([reading.catch(() => kept), late]);
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
