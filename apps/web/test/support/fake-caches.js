const addressOf = (key, { ignoreSearch = false } = {}) => {
  const url = new URL(typeof key === 'string' ? key : key.url);

  if (ignoreSearch) {
    url.search = '';
  }

  return url.href;
};

function fakeCache() {
  const entries = new Map();

  return {
    entries,
    async put(key, response) {
      entries.set(addressOf(key), response.clone());
    },

    async match(key, options) {
      const address = addressOf(key, options);
      const found = [...entries.keys()].find((stored) => addressOf(stored, options) === address);

      return found ? entries.get(found).clone() : undefined;
    },
  };
}

// The browser's Cache Storage, as far as the arcade's worker uses it.
export function fakeCaches() {
  const caches = new Map();

  return {
    caches,
    async open(name) {
      if (!caches.has(name)) {
        caches.set(name, fakeCache());
      }

      return caches.get(name);
    },

    // as the browser's: in the cache named, or in each one in turn, and it makes none
    async match(key, { cacheName, ...options } = {}) {
      const named = cacheName === undefined ? [...caches.values()] : [caches.get(cacheName)];

      for (const cache of named.filter(Boolean)) {
        const found = await cache.match(key, options);

        if (found) {
          return found;
        }
      }

      return undefined;
    },

    keys: async () => [...caches.keys()],
    delete: async (name) => caches.delete(name),
  };
}

// The server's answers by address, and a network that can go away, or hold its answers until the
// test lets `hold` settle; each request is noted with the time on the test's clock, if it has one.
export function fakeNetwork(files, clock = { now: 0 }) {
  const network = { online: true, requests: [], hold: null };

  network.fetch = async (request) => {
    const address = addressOf(request, { ignoreSearch: true });

    network.requests.push({ address, cache: request.cache, at: clock.now });
    await network.hold;

    if (!network.online) {
      throw new TypeError('Failed to fetch');
    }

    // a folder answers with its index.html, as the server does
    const body =
      files[address] ?? (address.endsWith('/') ? files[`${address}index.html`] : undefined);

    return body === undefined ? new Response('Not found', { status: 404 }) : new Response(body);
  };

  return network;
}
