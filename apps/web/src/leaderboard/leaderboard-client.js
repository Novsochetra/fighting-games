import { readBoard } from './read-board.js';

export const boardPath = (gameId) => `api/leaderboard?game=${encodeURIComponent(gameId)}`;

export async function fetchBoard(fetchFn, url) {
  const response = await fetchFn(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Loading ${url} failed with HTTP ${response.status}`);
  }

  return readBoard(await response.json());
}
