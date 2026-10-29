import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// A score can't be checked move by move, so each run starts by asking for a ticket the server signs
// with the time it was given. A score then needs one, used once, at least as old as the time it
// claims was played: posting a made-up score means waiting out the time it claims.
export const TICKET_LIMITS = {
  // a saved run can be picked up again weeks later
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
  // the ticket is asked for as the run starts, so it comes a moment after the run's clock does
  slackMs: 30 * 1000,
};

const TICKET = /^(\d{13})\.([\w-]{16})\.([\w-]{43})$/;
const NOT_OURS = 'That run ticket is not one this arcade gave.';

const sameMac = (sent, expected) => timingSafeEqual(Buffer.from(sent), Buffer.from(expected));

export function createRunTickets({ secret, now = Date.now }) {
  const sign = (body) => createHmac('sha256', secret).update(body).digest('base64url');

  function check(ticket, seconds) {
    const match = TICKET.exec(ticket);

    if (!match || !sameMac(match[3], sign(`${match[1]}.${match[2]}`))) {
      return { error: NOT_OURS };
    }

    const age = now() - Number(match[1]);

    if (age < 0 || age > TICKET_LIMITS.maxAgeMs) {
      return { error: 'That run is too old to post.' };
    }

    if (age + TICKET_LIMITS.slackMs < seconds * 1000) {
      return { error: 'That run was played faster than the clock allows.' };
    }

    return { nonce: match[2] };
  }

  return {
    issue() {
      const body = `${now()}.${randomBytes(12).toString('base64url')}`;

      return `${body}.${sign(body)}`;
    },

    check,
  };
}
