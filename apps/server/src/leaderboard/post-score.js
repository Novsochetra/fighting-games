import { BOARD_SIZE } from './create-leaderboard.js';
import { readScore } from './read-score.js';
import { presentScore } from './serialize-board.js';

const refusal = (status, message) => ({ status, message });

// a score is checked whole before anything is written: its fields against the game's rules, then
// its ticket against the time it claims, and a ticket is spent by the one score it carries
export async function postScore(leaderboard, body) {
  const { error, run, ticket } = readScore(body, await leaderboard.rulesByGame());

  if (error) {
    return refusal(400, error);
  }

  const checked = (await leaderboard.tickets()).check(ticket, run.seconds);

  if (checked.error) {
    return refusal(400, checked.error);
  }

  const saved = await leaderboard.scores.add(run, checked.nonce);

  if (!saved) {
    return refusal(409, 'That run is on the board already.');
  }

  const rank = await leaderboard.scores.rank(saved, leaderboard.weekStart());

  if (rank.week <= BOARD_SIZE || rank.allTime <= BOARD_SIZE) {
    leaderboard.boards.forget(run.game);
  }

  return { status: 201, json: JSON.stringify({ rank, score: presentScore(saved) }) };
}
