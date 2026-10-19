export const CATALOG_URL = 'api/games';

export async function fetchCatalog(fetchFn, url = CATALOG_URL) {
  const response = await fetchFn(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Loading ${url} failed with HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.games)) {
    throw new Error(`${url} did not return a game list`);
  }
  return payload.games;
}
