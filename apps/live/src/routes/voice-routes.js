import { checkGame } from '../parties/checks.js';
import { writeTicket } from '../voice/ticket.js';
import { voiceRoomName } from '../voice/voice-rooms.js';

// Only a member of the party, proved by the key make or join gave them, gets a ticket for its room.
export function createVoiceRoutes({ book, voice, games }) {
  async function ticket(body) {
    const game = checkGame(body.game, games);
    const { code, member } = book.member({ ...body, game });
    const room = voiceRoomName({ prefix: voice.roomPrefix, game, code });
    await voice.rooms.ensure(room);

    return writeTicket({ voice, room, identity: body.playerId, name: member.name });
  }

  return { '/api/voice/ticket': ticket };
}
