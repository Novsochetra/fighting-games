const GAME_PREFIX = 'game-';
// downloads at a time, so a game's own requests are not kept waiting behind its download
const AT_ONCE = 6;

const cacheNameOf = (id, revision) => `${GAME_PREFIX}${id}@${revision}`;
const markOf = (id, scope) => new URL(`games/${id}/.offline-complete`, scope).href;
const addressOf = (id, file, scope) => new URL(`games/${id}/${file}`, scope).href;

const revisionsOf = async (caches, id) =>
  (await caches.keys()).filter((name) => name.startsWith(cacheNameOf(id, '')));

// A game is played from what was downloaded only once every file of one revision is in, marked
// last, so a game half downloaded, or downloaded from two deploys, is never played. The browser
// lists its caches in the order they were made, and a revision's is made as its download starts,
// so these come oldest first. Looking for a mark makes no cache, so one let go meanwhile stays gone.
async function wholeRevisions({ caches, scope, id }) {
  const names = await revisionsOf(caches, id);
  const marks = await Promise.all(
    names.map((cacheName) => caches.match(markOf(id, scope), { cacheName })),
  );

  return names.filter((_, i) => marks[i]);
}

// Which revision each game plays from, worked out once and again only as a revision comes in or
// goes, so each of a game's thousand requests reads the one cache it plays from, not every
// revision's mark (the one a download fills among them): Chrome failed more of the game's files
// that way as it loaded.
const playing = new WeakMap();

function playingIn(caches) {
  if (!playing.has(caches)) {
    playing.set(caches, new Map());
  }

  return playing.get(caches);
}

const forget = ({ caches, id }) => playingIn(caches).delete(id);
const remember = ({ caches, id }, name) => playingIn(caches).set(id, Promise.resolve(name));

// The revision a game plays from: the oldest kept whole, which is the one an open page of it
// started on, since a revision that comes in behind a play waits for the next play to take over.
export function completeGame(context) {
  const games = playingIn(context.caches);

  if (!games.has(context.id)) {
    const oldest = wholeRevisions(context).then((names) => names[0] ?? null);

    games.set(context.id, oldest);
    oldest.catch(() => forget(context));
  }

  return games.get(context.id);
}

// A new page of the game plays its newest whole revision, so the older ones go as the page that
// played them is left; a download not whole yet stays to finish.
export async function keepNewestWhole(context) {
  const whole = await wholeRevisions(context);

  await Promise.all(whole.slice(0, -1).map((name) => context.caches.delete(name)));
  remember(context, whole.at(-1) ?? null);
}

// A player who removes a game while it comes down (a play keeping it fresh) wants none of it kept.
function stopIfRemoved(progress) {
  if (progress.removed) {
    throw new Error('removed by the player');
  }
}

// Each file is checked with the server (no-cache), so the files the game has just loaded for itself
// cost only a 304, not a second download; each waits until the game is not asking for its own.
async function downloadInto(cache, addresses, { fetch, progress, untilQuiet }) {
  const queue = [...addresses];
  const worker = async () => {
    for (let address = queue.shift(); address; address = queue.shift()) {
      await untilQuiet();
      stopIfRemoved(progress);

      if (!(await cache.match(address))) {
        const response = await fetch(new Request(address, { cache: 'no-cache' }));

        if (!response.ok) {
          throw new Error(`${address} answered ${response.status}`);
        }

        await cache.put(address, response);
      }

      progress.done += 1;
    }
  };

  await Promise.all(Array.from({ length: AT_ONCE }, worker));
}

// The whole game, on the player's save and again, on a play, after a deploy changes it: the list
// (offline.json, written by the build) names every file and the revision they make up, and
// `progress` counts the files in as they come. What a stopped download left half done goes once the
// new revision is in, but an older whole one stays: the game may still be loading from it, and
// taking it away under the page mixed the new revision's files into the old (keepNewestWhole lets
// it go).
export async function downloadGame({
  caches,
  fetch,
  scope,
  id,
  progress = { done: 0, total: 0 },
  untilQuiet = async () => {},
}) {
  const reply = await fetch(
    new Request(addressOf(id, 'offline.json', scope), { cache: 'no-store' }),
  );
  const { revision, files } = await reply.json();
  const name = cacheNameOf(id, revision);

  stopIfRemoved(progress);
  const cache = await caches.open(name);

  progress.total = files.length;

  if (await cache.match(markOf(id, scope))) {
    progress.done = files.length;
  } else {
    await downloadInto(
      cache,
      files.map((file) => addressOf(id, file, scope)),
      { fetch, progress, untilQuiet },
    );
    stopIfRemoved(progress);
    await cache.put(markOf(id, scope), new Response('complete'));
  }

  const whole = await wholeRevisions({ caches, scope, id });
  const halfDone = (await revisionsOf(caches, id)).filter((other) => !whole.includes(other));

  await Promise.all(halfDone.map((other) => caches.delete(other)));
  remember({ caches, id }, whole[0] ?? null);
}

// Every revision of a game, whole or half come down, so removing it frees all the room it took.
export async function removeGame({ caches, id }) {
  const names = await revisionsOf(caches, id);

  await Promise.all(names.map((name) => caches.delete(name)));
  forget({ caches, id });
}

// A game's folder is its page.
const keyOf = (request) => {
  const url = new URL(request.url);

  url.search = '';

  return url.pathname.endsWith('/') ? `${url.href}index.html` : url.href;
};

export async function fromGame({ caches, scope, id, request }) {
  const cacheName = await completeGame({ caches, scope, id });

  return cacheName ? caches.match(keyOf(request), { cacheName }) : undefined;
}
