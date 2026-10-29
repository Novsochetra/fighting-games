import { readJsonBody } from '../http/read-json-body.js';
import { sendForbidden, sendJson, sendJsonError } from '../http-responses.js';
import { postScore } from '../leaderboard/post-score.js';
import { clientAddressOf, createRateLimiter } from '../security/rate-limit.js';
import { isFromOwnPage } from '../security/request-origin.js';
import { splitRequestTarget } from '../static-path.js';

// a run lasts minutes, so a visitor posting more than this is not posting runs
export const SCORE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

const gameAsked = (request) =>
  new URLSearchParams(splitRequestTarget(request.url).query).get('game');

export function createLeaderboardApi({ leaderboard, trustProxy = false, limiter }) {
  const allowScore = limiter ?? createRateLimiter(SCORE_LIMIT);

  async function read(request, response) {
    const game = gameAsked(request);

    if (!(await leaderboard.rulesByGame()).has(game)) {
      return sendJsonError(response, { status: 404, message: 'That game has no leaderboard.' });
    }

    return sendJson(response, { status: 200, json: await leaderboard.boards.get(game) });
  }

  async function post(request, response) {
    if (!isFromOwnPage(request.headers)) {
      return sendForbidden(response);
    }

    const body = await readJsonBody(request);

    if (!body.ok) {
      return sendJsonError(response, { status: body.status, message: body.message });
    }

    if (!allowScore(clientAddressOf(request, { trustProxy }))) {
      const message = 'That is a lot of scores at once. Try again in a few minutes.';

      return sendJsonError(response, { status: 429, message, headers: { 'Retry-After': '600' } });
    }

    const result = await postScore(leaderboard, body.value);

    return result.json
      ? sendJson(response, result)
      : sendJsonError(response, { status: result.status, message: result.message });
  }

  return { GET: read, POST: post };
}
