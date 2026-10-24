// Browsers set Sec-Fetch-Site and Origin themselves and page scripts cannot change them, so these
// tell a call from the arcade's own pages apart from one another website makes in its visitor's
// browser. A script outside a browser can send any header it likes; the rate limit and the checks
// on each gift are what hold against that.
const OTHER_SITE_FETCHES = new Set(['same-site', 'cross-site']);

function hostOf(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

export function isFromOtherSite(headers) {
  if (OTHER_SITE_FETCHES.has(headers['sec-fetch-site'])) {
    return true;
  }
  return headers.origin !== undefined && hostOf(headers.origin) !== headers.host;
}

// Every browser sends Origin with a POST, also to its own site, so a POST without one did not come
// from an arcade page.
export function isFromOwnPage(headers) {
  return headers.origin !== undefined && !isFromOtherSite(headers);
}
