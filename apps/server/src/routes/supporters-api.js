import { readJsonBody } from '../http/read-json-body.js';
import { sendForbidden, sendJson, sendJsonError } from '../http-responses.js';
import { clientAddressOf, createRateLimiter } from '../security/rate-limit.js';
import { isFromOwnPage } from '../security/request-origin.js';
import { readDonation } from '../supporters/read-donation.js';
import { presentSupporter, serializeSupporters } from '../supporters/serialize-supporters.js';

// No one can check a gift was really sent, so a burst of them from one address is held back.
export const GIFT_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export function createSupportersApi({ supporters, trustProxy = false, limiter }) {
  const allowGift = limiter ?? createRateLimiter(GIFT_LIMIT);

  async function list(_request, response) {
    sendJson(response, { status: 200, json: serializeSupporters(await supporters.list()) });
  }

  async function add(request, response) {
    if (!isFromOwnPage(request.headers)) {
      return sendForbidden(response);
    }
    const body = await readJsonBody(request);
    if (!body.ok) {
      return sendJsonError(response, { status: body.status, message: body.message });
    }
    const { donation, error } = readDonation(body.value);
    if (error) {
      return sendJsonError(response, { status: 400, message: error });
    }
    if (!allowGift(clientAddressOf(request, { trustProxy }))) {
      const message = 'That is a lot of gifts at once. Try again in a few minutes.';
      return sendJsonError(response, { status: 429, message, headers: { 'Retry-After': '600' } });
    }
    const saved = await supporters.add(donation);
    const json = JSON.stringify({ supporter: presentSupporter(saved) });
    return sendJson(response, { status: 201, json });
  }

  return { GET: list, POST: add };
}
