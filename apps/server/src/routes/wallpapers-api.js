import { readJsonBody } from '../http/read-json-body.js';
import { sendForbidden, sendJson, sendJsonError } from '../http-responses.js';
import { WALLPAPER_LIST } from '../paths.js';
import { clientAddressOf, createRateLimiter } from '../security/rate-limit.js';
import { isFromOwnPage } from '../security/request-origin.js';
import { readDownload, readLike } from '../wallpapers/read-wallpaper-acts.js';
import { createWallpaperIds } from '../wallpapers/wallpaper-ids.js';

// A like is one a visitor, but a script can make up visitors, and a download cannot be checked at
// all: a burst of either from one address is held back.
export const LIKE_LIMIT = { limit: 60, windowMs: 10 * 60 * 1000 };
export const DOWNLOAD_LIMIT = { limit: 40, windowMs: 10 * 60 * 1000 };

const BUSY = 'That is a lot at once. Try again in a few minutes.';

// The likes and downloads of every wallpaper that has any; the rest have none.
export function createWallpaperCountsApi({ wallpapers }) {
  async function list(_request, response) {
    const counts = await wallpapers.counts();
    const byId = Object.fromEntries(
      counts.map(({ wallpaper, likes, downloads }) => [wallpaper, { likes, downloads }]),
    );

    sendJson(response, { status: 200, json: JSON.stringify({ wallpapers: byId }) });
  }

  return { GET: list };
}

// Checks one act on a wallpaper (read turns the body into it, or an error) and hands it to act.
function createWallpaperAct({ read, act, allow, trustProxy, listFile }) {
  const wallpaperIds = createWallpaperIds(listFile);

  return async function handle(request, response) {
    if (!isFromOwnPage(request.headers)) {
      return sendForbidden(response);
    }

    const body = await readJsonBody(request);

    if (!body.ok) {
      return sendJsonError(response, { status: body.status, message: body.message });
    }

    const { error, value } = read(body.value, await wallpaperIds());

    if (error) {
      return sendJsonError(response, { status: 400, message: error });
    }

    if (!allow(clientAddressOf(request, { trustProxy }))) {
      return sendJsonError(response, {
        status: 429,
        message: BUSY,
        headers: { 'Retry-After': '600' },
      });
    }

    return act(value, response);
  };
}

export function createWallpaperLikesApi({
  wallpapers,
  trustProxy = false,
  limiter,
  listFile = WALLPAPER_LIST,
}) {
  const read = (body, ids) => {
    const { like, error } = readLike(body, ids);

    return { error, value: like };
  };
  const act = async (like, response) => {
    const likes = await wallpapers.setLike(like);
    const json = JSON.stringify({ wallpaper: like.wallpaper, liked: like.liked, likes });

    sendJson(response, { status: 200, json });
  };
  const allow = limiter ?? createRateLimiter(LIKE_LIMIT);

  return { POST: createWallpaperAct({ read, act, allow, trustProxy, listFile }) };
}

export function createWallpaperDownloadsApi({
  wallpapers,
  trustProxy = false,
  limiter,
  listFile = WALLPAPER_LIST,
}) {
  const read = (body, ids) => {
    const { download, error } = readDownload(body, ids);

    return { error, value: download };
  };
  const act = async (download, response) => {
    const downloads = await wallpapers.addDownload(download);
    const json = JSON.stringify({ wallpaper: download.wallpaper, downloads });

    sendJson(response, { status: 201, json });
  };
  const allow = limiter ?? createRateLimiter(DOWNLOAD_LIMIT);

  return { POST: createWallpaperAct({ read, act, allow, trustProxy, listFile }) };
}
