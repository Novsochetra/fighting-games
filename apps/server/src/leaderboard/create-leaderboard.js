import { weekStartOf } from '../arcade-time.js';
import { createBoardCache } from './board-cache.js';
import { createBoardRules } from './board-rules.js';
import { createRunTickets } from './run-tickets.js';
import { serializeBoard } from './serialize-board.js';

export const BOARD_SIZE = 10;

// the secret lives with the scores, so it is read once, as the first ticket is asked for or checked
function lazyTickets(scores, now) {
  let tickets = null;

  return () => {
    tickets ??= scores.secret().then(
      (secret) => createRunTickets({ secret, now }),
      (error) => {
        tickets = null;
        throw error;
      },
    );

    return tickets;
  };
}

export function createLeaderboard({ gamesRoot, scores, storage = null, now = Date.now }) {
  const weekStart = () => weekStartOf(new Date(now()));

  async function loadBoard(game) {
    const start = weekStart();
    const board = await scores.board(game, { weekStart: start, size: BOARD_SIZE });

    return serializeBoard(board, { weekStart: start, storage });
  }

  return {
    scores,
    storage,
    now,
    weekStart,
    rulesByGame: createBoardRules(gamesRoot),
    tickets: lazyTickets(scores, now),
    boards: createBoardCache({ load: loadBoard, now }),
  };
}
