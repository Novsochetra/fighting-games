import { readSupporters } from './read-supporters.js';

export const SUPPORTERS_URL = '../api/supporters';

export async function fetchSupporters(fetchFn, url = SUPPORTERS_URL) {
  const response = await fetchFn(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Loading ${url} failed with HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.supporters)) {
    throw new Error(`${url} did not return a supporter list`);
  }
  return readSupporters(payload);
}
