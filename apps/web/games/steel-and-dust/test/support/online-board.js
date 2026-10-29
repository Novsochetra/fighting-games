import { vi } from 'vitest';
import { createOnlineBoard } from '../../src/online/online-board.js';
import { createRunTicket } from '../../src/online/run-ticket.js';
import { memoryStorage } from './memory-storage.js';

const EMPTY_BOARD = { weekStart: '2026-10-26', week: [], allTime: [] };

// the arcade's leaderboard API as the game calls it, answering at once with what the test sets
export function fakeBoardApi(answers = {}) {
  return {
    loadBoard: vi.fn(async () => answers.board ?? EMPTY_BOARD),
    requestTicket: vi.fn(async () => answers.ticket ?? 'ticket-1'),
    postScore: vi.fn(async () => answers.posted ?? { rank: { week: 1, allTime: 4 } }),
  };
}

export function createTestOnline({ api = fakeBoardApi(), storage = memoryStorage(), now } = {}) {
  const ticket = createRunTicket({ api, storage });
  return { api, storage, online: createOnlineBoard({ api, ticket, storage, now }) };
}
