import { readJsonBody } from '../http/read-json-body.js';
import { sendForbidden, sendJson, sendJsonError } from '../http-responses.js';
import { base64Length, POSTER_SIZES } from '../leaderboard/poster-files.js';
import { postPoster } from '../leaderboard/post-poster.js';
import { clientAddressOf, createRateLimiter } from '../security/rate-limit.js';
import { isFromOwnPage } from '../security/request-origin.js';

// a poster follows each score posted, which has the same limit
export const POSTER_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };
export const MAX_POSTER_BODY_BYTES = POSTER_SIZES.reduce(
  (total, size) => total + base64Length(size.maxBytes),
  1024,
);

export function createPostersApi({ leaderboard, trustProxy = false, limiter }) {
  const allowPoster = limiter ?? createRateLimiter(POSTER_LIMIT);

  async function post(request, response) {
    if (!isFromOwnPage(request.headers)) {
      return sendForbidden(response);
    }

    // counted before the body is read, as a poster's is large
    if (!allowPoster(clientAddressOf(request, { trustProxy }))) {
      const message = 'That is a lot of posters at once. Try again in a few minutes.';

      return sendJsonError(response, { status: 429, message, headers: { 'Retry-After': '600' } });
    }

    const body = await readJsonBody(request, MAX_POSTER_BODY_BYTES);
    const result = body.ok ? await postPoster(leaderboard, body.value) : body;

    return result.json
      ? sendJson(response, result)
      : sendJsonError(response, { status: result.status, message: result.message });
  }

  return { POST: post };
}
