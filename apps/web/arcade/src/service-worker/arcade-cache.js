export const ARCADE_PREFIX = 'arcade-build-';

// One cache per build of the arcade, named by its files' revisions, so a deploy fills a new one
// while the old one still answers the pages open on the old build.
export function arcadeCacheName(manifest) {
  let hash = 2166136261;

  for (const { url, revision } of manifest) {
    for (const character of `${url}@${revision ?? ''};`) {
      hash = Math.imul(hash ^ character.codePointAt(0), 16777619) >>> 0;
    }
  }

  return `${ARCADE_PREFIX}${hash.toString(16)}`;
}

// The arcade's pages, its built modules and styles, its art and each game's card art, each checked
// with the server (no-cache), so a deploy's files are never kept with an older one's, while a file
// the browser already holds costs only a 304.
export async function keepArcade({ caches, fetch, manifest, scope }) {
  const cache = await caches.open(arcadeCacheName(manifest));

  await Promise.all(
    manifest.map(async ({ url }) => {
      const address = new URL(url, scope).href;
      const response = await fetch(new Request(address, { cache: 'no-cache' }));

      if (!response.ok) {
        throw new Error(`${address} answered ${response.status}`);
      }

      await cache.put(address, response);
    }),
  );
}

export async function dropOtherArcades({ caches, manifest }) {
  const kept = arcadeCacheName(manifest);
  const names = await caches.keys();

  await Promise.all(
    names
      .filter((name) => name.startsWith(ARCADE_PREFIX) && name !== kept)
      .map((name) => caches.delete(name)),
  );
}

export async function fromArcade({ caches, manifest, scope, key }) {
  const cache = await caches.open(arcadeCacheName(manifest));

  return cache.match(new URL(key, scope).href);
}
