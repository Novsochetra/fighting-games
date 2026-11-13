const SEND_FAILED = 'That did not go through. Check your connection and try again.';

const countOf = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);

// Every wallpaper's likes and downloads, by id; one the server does not name has none yet.
export function readWallpaperCounts(payload) {
  const named = payload?.wallpapers;

  if (typeof named !== 'object' || named === null || Array.isArray(named)) {
    throw new Error('The wallpapers did not come with their counts');
  }

  return Object.fromEntries(
    Object.entries(named).map(([id, count]) => [
      id,
      { likes: countOf(count?.likes), downloads: countOf(count?.downloads) },
    ]),
  );
}

export async function fetchWallpaperCounts(fetchFn, url) {
  const response = await fetchFn(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Loading ${url} failed with HTTP ${response.status}`);
  }

  return readWallpaperCounts(await response.json());
}

async function post(fetchFn, url, body) {
  let response;

  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(SEND_FAILED);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : SEND_FAILED);
  }

  return payload;
}

export async function postLike(fetchFn, url, like) {
  return countOf((await post(fetchFn, url, like)).likes);
}

export async function postDownload(fetchFn, url, download) {
  return countOf((await post(fetchFn, url, download)).downloads);
}
