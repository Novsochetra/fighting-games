import { AccessToken, TrackSource } from 'livekit-server-sdk';

// Long enough to join; once in, LiveKit keeps the player in and renews the ticket itself.
const TICKET_TTL = '10m';

// The ticket is handed to a stranger's browser, so it carries only the rights a voice chat needs.
export async function writeTicket({ voice, room, identity, name }) {
  const token = new AccessToken(voice.apiKey, voice.apiSecret, { identity, name, ttl: TICKET_TTL });
  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: false,
    canPublishSources: [TrackSource.MICROPHONE],
    canUpdateOwnMetadata: false,
  });

  return { url: voice.url, room, token: await token.toJwt() };
}
