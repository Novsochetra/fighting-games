// Every player who opens the board reads the same few rows, so the server answers them from one
// read of the database for a while, and readers who come while it is under way wait on that same
// read. A score that changes the board drops it at once.
export const BOARD_FRESH_MS = 15 * 1000;

export function createBoardCache({ load, freshMs = BOARD_FRESH_MS, now = Date.now }) {
  const kept = new Map();

  return {
    get(game) {
      const entry = kept.get(game);

      if (entry && now() - entry.at < freshMs) {
        return entry.answer;
      }

      const answer = load(game);
      const fresh = { at: now(), answer };

      kept.set(game, fresh);
      // a failed read is not kept, so the next reader tries the database again
      answer.catch(() => kept.get(game) === fresh && kept.delete(game));

      return answer;
    },

    forget(game) {
      kept.delete(game);
    },
  };
}
