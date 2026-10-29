// A secure web address with no login in it: what a game on its own site, or a trailer on a CDN, may
// be served from. The catalog is data, so nothing else becomes a link or a source on the page.
export function isSecureUrl(value) {
  if (typeof value !== 'string' || /\s/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}
