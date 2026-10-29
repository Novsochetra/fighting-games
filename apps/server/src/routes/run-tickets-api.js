import { sendForbidden, sendJson, sendJsonError } from '../http-responses.js';
import { clientAddressOf, createRateLimiter } from '../security/rate-limit.js';
import { isFromOwnPage } from '../security/request-origin.js';

// each new run and each restarted mission asks for one; a ticket costs the server no write, but a
// pile of them would let one visitor post many made-up scores at once
export const TICKET_LIMIT = { limit: 30, windowMs: 10 * 60 * 1000 };

export function createRunTicketsApi({ leaderboard, trustProxy = false, limiter }) {
  const allowTicket = limiter ?? createRateLimiter(TICKET_LIMIT);

  async function give(request, response) {
    if (!isFromOwnPage(request.headers)) {
      return sendForbidden(response);
    }

    if (!allowTicket(clientAddressOf(request, { trustProxy }))) {
      const message = 'That is a lot of runs at once. Try again in a few minutes.';

      return sendJsonError(response, { status: 429, message, headers: { 'Retry-After': '600' } });
    }

    const ticket = (await leaderboard.tickets()).issue();

    return sendJson(response, { status: 201, json: JSON.stringify({ ticket }) });
  }

  return { POST: give };
}
