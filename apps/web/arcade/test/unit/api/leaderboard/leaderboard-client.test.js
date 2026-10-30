import { describe, expect, it, vi } from 'vitest';
import { boardPath, fetchBoard } from '@/api/leaderboard/leaderboard-client.js';
import { sampleBoard } from '../../../support/leaderboard-harness.js';

describe('fetchBoard', () => {
  it("asks for a game's board by its id, and reads what comes", async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, json: async () => sampleBoard() }));
    const board = await fetchBoard(fetchFn, boardPath('steel-and-dust'));
    expect(fetchFn.mock.calls[0][0]).toBe('api/leaderboard?game=steel-and-dust');
    expect(board.week).toHaveLength(4);
  });

  it('fails on an answer that is not one', async () => {
    const fetchFn = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchBoard(fetchFn, 'api/leaderboard?game=x')).rejects.toThrow(/503/);
  });
});
