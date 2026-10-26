const GAME_PREFIX = 'game-';
// downloads at a time, so a game's own requests are not kept waiting behind its download
const AT_ONCE = 6;

const cacheNameOf = (id, revision) => `${GAME_PREFIX}${id}@${revision}`;
const markOf = (id, scope) => new URL(`games/${id}/.offline-complete`, scope).href;
const addressOf = (id, file, scope) => new URL(`games/${id}/${file}`, scope).href;

// A game is played from what was downloaded only once every file of one revision is in, marked
// last, so a game half downloaded, or downloaded from two deploys, is never played.
export async function completeGame({ caches, scope, id }) {
  const names = (await caches.keys()).filter((name) => name.startsWith(cacheNameOf(id, '')));

  for (const name of names) {
    const cache = await caches.open(name);

    if (await cache.match(markOf(id, scope))) {
      return cache;
    }
  }

  return null;
}

// Each file is checked with the server (no-cache), so the files the game has just loaded for itself
// cost only a 304, not a second download.
async function downloadInto(cache, addresses, fetch) {
  const queue = [...addresses];
  const worker = async () => {
    for (let address = queue.shift(); address; address = queue.shift()) {
      if (!(await cache.match(address))) {
        const response = await fetch(new Request(address, { cache: 'no-cache' }));

        if (!response.ok) {
          throw new Error(`${address} answered ${response.status}`);
        }

        await cache.put(address, response);
      }
    }
  };

  await Promise.all(Array.from({ length: AT_ONCE }, worker));
}

// The whole game, on its first play and again after a deploy changes it: the list (offline.json,
// written by the build) names every file and the revision they make up. An older revision goes
// once the new one is in.
export async function downloadGame({ caches, fetch, scope, id }) {
  const reply = await fetch(
    new Request(addressOf(id, 'offline.json', scope), { cache: 'no-store' }),
  );
  const { revision, files } = await reply.json();
  const name = cacheNameOf(id, revision);
  const cache = await caches.open(name);

  if (!(await cache.match(markOf(id, scope)))) {
    await downloadInto(
      cache,
      files.map((file) => addressOf(id, file, scope)),
      fetch,
    );
    await cache.put(markOf(id, scope), new Response('complete'));
  }

  const others = (await caches.keys()).filter(
    (other) => other.startsWith(cacheNameOf(id, '')) && other !== name,
  );

  await Promise.all(others.map((other) => caches.delete(other)));
}

// A game's folder is its page.
const keyOf = (request) => {
  const url = new URL(request.url);

  url.search = '';

  return url.pathname.endsWith('/') ? `${url.href}index.html` : url.href;
};

export async function fromGame({ caches, scope, id, request }) {
  const cache = await completeGame({ caches, scope, id });

  return cache ? cache.match(keyOf(request)) : undefined;
}
