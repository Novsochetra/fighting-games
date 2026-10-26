// The version of the build a page comes from, which the build writes into its head (vite.config.ts);
// a page Vite serves as it is written (npm run dev) names none.
export const pageVersion = (document) =>
  document.querySelector('meta[name="arcade-version"]')?.getAttribute('content') || null;

// The version of the build the server holds now, checked with the server past the browser's cache
// (the worker leaves it to the network), or null where it can't say, as offline.
export async function servedVersion(fetch, root) {
  try {
    const response = await fetch(new URL('version.json', root).href, { cache: 'no-cache' });
    const body = response.ok ? await response.json() : null;

    return typeof body?.version === 'string' ? body.version : null;
  } catch {
    return null;
  }
}
