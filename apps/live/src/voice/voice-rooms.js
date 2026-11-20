import { MAX_MEMBERS } from '../parties/party-members.js';

const EMPTY_ROOM_SECONDS = 10 * 60;

export function voiceRoomName({ prefix, game, code }) {
  return `${prefix}${game}-party-${code}`;
}

// The room is made with the party's own limit before each ticket, so LiveKit too refuses a ninth.
// It is asked every time, not remembered: LiveKit closes an empty room, and one it then opened by
// itself for a ticket would have no limit.
export function createVoiceRooms(roomService) {
  async function ensure(room) {
    await roomService.createRoom({
      name: room,
      maxParticipants: MAX_MEMBERS,
      emptyTimeout: EMPTY_ROOM_SECONDS,
    });
  }

  async function drop(room, identity) {
    try {
      await roomService.removeParticipant(room, identity);
    } catch {
      // Not in the voice room: there is nobody to take out.
    }
  }

  return { ensure, drop };
}
