import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { contentTypeFor } from '../content-types.js';
import { BASE_HEADERS, sendNotFound, sendRedirect } from '../http-responses.js';
import { resolveStaticTarget, splitRequestTarget } from '../static-path.js';

export function createStaticHandler({ webRoot }) {
  return async function serveStatic(request, response) {
    const { pathname, query } = splitRequestTarget(request.url);
    const target = resolveStaticTarget(webRoot, pathname);
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
    return sendFile({ request, response, filePath: target.filePath, size: stats.size });
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
  return sendFile({ request, response, filePath: indexPath, size: stats.size });
}

function sendFile({ request, response, filePath, size }) {
  response.writeHead(200, {
    ...BASE_HEADERS,
    'Content-Type': contentTypeFor(filePath),
    'Content-Length': size,
  });
  if (request.method === 'HEAD') {
    return response.end();
  }
  const stream = createReadStream(filePath);
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
