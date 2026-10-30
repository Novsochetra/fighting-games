import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { contentTypeFor } from '../content-types.js';
import { BASE_HEADERS, sendNotFound, sendRedirect } from '../http-responses.js';
import { resolveStaticTarget, splitRequestTarget } from '../static-path.js';
import { byteRangeOf } from './byte-range.js';
import { matchesTag, tagOf } from './file-tags.js';

// A file named by its content (isImmutable) never changes, so a browser keeps it for a year without
// asking again; every other file it checks on each visit.
const KEPT_FOR_A_YEAR = 'public, max-age=31536000, immutable';

export function createStaticHandler({ webRoot, mounts, isImmutable = () => false }) {
  return async function serveStatic(request, response) {
    const { pathname, query } = splitRequestTarget(request.url);
    const target = resolveStaticTarget(webRoot, pathname, mounts);
    const stats = target && (await statOrNull(target.filePath));
    if (!stats) {
      return sendNotFound(response);
    }
    if (stats.isDirectory()) {
      return serveDirectory({ request, response, target, query });
    }
    if (!stats.isFile() || target.trailingSlash) {
      return sendNotFound(response);
    }
    const cache = isImmutable(target.canonicalPath) ? KEPT_FOR_A_YEAR : null;

    return sendFile({ request, response, filePath: target.filePath, stats, cache });
  };
}

async function serveDirectory({ request, response, target, query }) {
  if (!target.trailingSlash) {
    return sendRedirect(response, `${target.canonicalPath}/${query}`);
  }
  const indexPath = path.join(target.filePath, 'index.html');
  const stats = await statOrNull(indexPath);
  if (!stats?.isFile()) {
    return sendNotFound(response);
  }
  return sendFile({ request, response, filePath: indexPath, stats });
}

async function sendFile({ request, response, filePath, stats, cache = null }) {
  const tag = await tagOf(filePath, stats);
  const headers = {
    ...BASE_HEADERS,
    ...(cache && { 'Cache-Control': cache }),
    ETag: tag,
    'Accept-Ranges': 'bytes',
  };

  if (matchesTag(request.headers['if-none-match'], tag)) {
    response.writeHead(304, headers);
    return response.end();
  }

  const range = rangeOf(request, tag, stats.size);

  if (range === 'none') {
    response.writeHead(416, { ...headers, 'Content-Range': `bytes */${stats.size}` });
    return response.end();
  }

  return sendBytes({ request, response, filePath, stats, headers, range });
}

function rangeOf(request, tag, size) {
  const ifRange = request.headers['if-range'];

  return ifRange === undefined || ifRange === tag ? byteRangeOf(request.headers.range, size) : null;
}

function sendBytes({ request, response, filePath, stats, headers, range }) {
  const part = range && { 'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}` };

  response.writeHead(range ? 206 : 200, {
    ...headers,
    ...part,
    'Content-Type': contentTypeFor(filePath),
    'Content-Length': range ? range.end - range.start + 1 : stats.size,
  });

  if (request.method === 'HEAD') {
    return response.end();
  }

  const stream = createReadStream(filePath, range ?? {});

  stream.on('error', () => response.destroy());

  return stream.pipe(response);
}

async function statOrNull(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}
