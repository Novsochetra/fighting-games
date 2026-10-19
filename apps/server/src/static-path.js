import path from 'node:path';
import { isHiddenName } from './public-files.js';

export function splitRequestTarget(rawUrl) {
  const queryStart = rawUrl.indexOf('?');
  if (queryStart === -1) {
    return { pathname: rawUrl, query: '' };
  }
  return { pathname: rawUrl.slice(0, queryStart), query: rawUrl.slice(queryStart) };
}

export function toPublicSegments(rawPathname) {
  if (!rawPathname.startsWith('/')) {
    return null;
  }
  const parts = rawPathname.slice(1).split('/');
  const trailingSlash = parts.at(-1) === '';
  const segments = (trailingSlash ? parts.slice(0, -1) : parts).map(decodeSegment);
  return segments.every(isPublicSegment) ? { segments, trailingSlash } : null;
}

function decodeSegment(rawSegment) {
  try {
    return decodeURIComponent(rawSegment);
  } catch {
    return null;
  }
}

// Checked after decoding so %2e%2e, %2f and %00 cannot smuggle "..", "/" or a null byte through.
function isPublicSegment(segment) {
  if (typeof segment !== 'string' || segment === '') {
    return false;
  }
  if (segment.includes('/') || segment.includes('\\') || segment.includes('\0')) {
    return false;
  }
  return !isHiddenName(segment);
}

export function resolveStaticTarget(webRoot, rawPathname) {
  const parsed = toPublicSegments(rawPathname);
  if (!parsed) {
    return null;
  }
  const root = path.resolve(webRoot);
  const filePath = path.resolve(root, ...parsed.segments);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  const canonicalPath = `/${parsed.segments.map(encodeURIComponent).join('/')}`;
  return { filePath, trailingSlash: parsed.trailingSlash, canonicalPath };
}
