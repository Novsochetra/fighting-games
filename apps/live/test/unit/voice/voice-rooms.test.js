import { describe, expect, it } from 'vitest';
import { createVoiceRooms, voiceRoomName } from '../../../src/voice/voice-rooms.js';

function recordingRoomService({ failRemove = false } = {}) {
  const calls = [];

  return {
    calls,
    createRoom: async (options) => calls.push(['create', options]),

    removeParticipant: async (room, identity) => {
      calls.push(['remove', room, identity]);
      if (failRemove) {
        throw new Error('participant not found');
      }
    },
  };
}

describe('voice rooms', () => {
  it('are named by game and party, after the prefix of the test room', () => {
    expect(voiceRoomName({ prefix: 'test-', game: 'morodok-angkor', code: 'K7QM2P' })).toBe(
      'test-morodok-angkor-party-K7QM2P',
    );
  });

  it('are made with room for eight, every time a ticket is written', async () => {
    const service = recordingRoomService();
    const rooms = createVoiceRooms(service);

    await rooms.ensure('a');
    await rooms.ensure('a');

    expect(service.calls).toEqual([
      ['create', { name: 'a', maxParticipants: 8, emptyTimeout: 600 }],
      ['create', { name: 'a', maxParticipants: 8, emptyTimeout: 600 }],
    ]);
  });

  it('take a player out, and shrug when they were not in voice', async () => {
    const service = recordingRoomService({ failRemove: true });

    await expect(createVoiceRooms(service).drop('a', 'player-0001')).resolves.toBeUndefined();
    expect(service.calls).toEqual([['remove', 'a', 'player-0001']]);
  });
});
