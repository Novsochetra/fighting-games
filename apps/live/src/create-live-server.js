import http from 'node:http';
import { sendServerError } from '@arcade/server/src/http-responses.js';
import { clientAddressOf, createRateLimiter } from '@arcade/server/src/security/rate-limit.js';
import { answer } from './http/answer.js';
import { createPartyBook } from './parties/party-book.js';
import { createPartyRoutes } from './routes/party-routes.js';
import { createVoiceRoutes } from './routes/voice-routes.js';
import { createVoiceRooms } from './voice/voice-rooms.js';

const SWEEP_MS = 60_000;

function createCallGuard({ trustProxy, now }) {
  const anyCall = createRateLimiter({ limit: 40, windowMs: 10_000, now });
  const making = createRateLimiter({ limit: 6, windowMs: 60_000, now });

  return function allowCall(request, pathname) {
    const address = clientAddressOf(request, { trustProxy });

    return anyCall(address) && (pathname !== '/api/party/make' || making(address));
  };
}

export function createLiveServer({
  config,
  roomService,
  now = Date.now,
  logError = console.error,
}) {
  const book = createPartyBook({ now });
  const voice = { ...config.voice, rooms: createVoiceRooms(roomService) };
  const shared = { book, voice, games: config.games };
  const live = {
    origins: config.origins,
    routes: { ...createPartyRoutes(shared), ...createVoiceRoutes(shared) },
    allowCall: createCallGuard({ trustProxy: config.trustProxy, now }),
    partyCount: book.size,
  };

  const server = http.createServer((request, response) => {
    answer({ request, response, live }).catch((error) => {
      logError(error);
      if (response.headersSent) {
        response.destroy();
      } else {
        sendServerError(response);
      }
    });
  });

  const sweeper = setInterval(book.sweep, SWEEP_MS);
  sweeper.unref();
  server.on('close', () => clearInterval(sweeper));

  return server;
}
