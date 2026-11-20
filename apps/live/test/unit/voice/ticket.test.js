import { TokenVerifier } from 'livekit-server-sdk';
import { describe, expect, it } from 'vitest';
import { writeTicket } from '../../../src/voice/ticket.js';
import { voiceRoomName } from '../../../src/voice/voice-rooms.js';

const voice = {
  url: 'wss://voice.example.test',
  apiKey: 'APItest',
  apiSecret: 'a-test-secret-that-is-long-enough-for-hs256-0123456789',
};

async function claimsOf(ticket) {
  return new TokenVerifier(voice.apiKey, voice.apiSecret).verify(ticket.token);
}

describe('a voice ticket', () => {
  it('opens one party room for one player, as LiveKit reads it', async () => {
    const room = voiceRoomName({ prefix: '', game: 'morodok-angkor', code: 'K7QM2P' });
    const ticket = await writeTicket({ voice, room, identity: 'player-0001', name: 'Dara' });
    const claims = await claimsOf(ticket);

    expect(ticket).toMatchObject({ url: voice.url, room: 'morodok-angkor-party-K7QM2P' });
    expect(claims.sub).toBe('player-0001');
    expect(claims.name).toBe('Dara');
    expect(claims.video).toMatchObject({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });
  });

  it('allows a microphone only: no camera, screen, data or admin', async () => {
    const ticket = await writeTicket({ voice, room: 'r', identity: 'player-0001', name: 'Dara' });
    const { video } = await claimsOf(ticket);

    expect(video.canPublishSources).toEqual(['microphone']);
    expect(video.canPublishData).toBe(false);
    expect(video.roomAdmin).toBeFalsy();
    expect(video.roomCreate).toBeFalsy();
    expect(video.roomRecord).toBeFalsy();
  });

  it('is short-lived', async () => {
    const ticket = await writeTicket({ voice, room: 'r', identity: 'player-0001', name: 'Dara' });
    const claims = await claimsOf(ticket);

    expect(claims.exp - claims.nbf).toBeLessThanOrEqual(10 * 60);
  });

  it('is refused when signed with another secret', async () => {
    const ticket = await writeTicket({ voice, room: 'r', identity: 'player-0001', name: 'Dara' });
    const other = new TokenVerifier(voice.apiKey, 'another-secret-also-long-enough-0123456789');

    await expect(other.verify(ticket.token)).rejects.toThrow();
  });
});
