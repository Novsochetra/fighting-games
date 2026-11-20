import { checkGame } from '../parties/checks.js';
import { voiceRoomName } from '../voice/voice-rooms.js';

export function createPartyRoutes({ book, voice, games }) {
  const askOf = (body) => ({ ...body, game: checkGame(body.game, games) });
  const roomOf = (game, code) => voiceRoomName({ prefix: voice.roomPrefix, game, code });

  async function make(body) {
    const ask = askOf(body);
    const made = book.make(ask);

    return { ...made, ...book.state({ ...ask, ...made }) };
  }

  async function join(body) {
    const ask = askOf(body);
    const joined = book.join(ask);

    return { ...joined, ...book.state({ ...ask, ...joined }) };
  }

  async function leave(body) {
    const ask = askOf(body);
    const code = book.leave(ask);
    await voice.rooms.drop(roomOf(ask.game, code), ask.playerId);

    return { ok: true };
  }

  async function remove(body) {
    const ask = askOf(body);
    const code = book.remove(ask);
    await voice.rooms.drop(roomOf(ask.game, code), ask.target);

    return book.state(ask);
  }

  return {
    '/api/party/make': make,
    '/api/party/join': join,
    '/api/party/state': async (body) => book.state(askOf(body)),
    '/api/party/leave': leave,
    '/api/party/remove': remove,
  };
}
