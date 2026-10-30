// How long a game goes without asking for a file of its own before its download carries on.
export const QUIET_MS = 2000;

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A game's download in the background waits while the game asks for files of its own (its thousand
// modules as it starts, a road's art as a mission loads), so on a phone's connection the game's own
// files come first, not behind some 13 MB of the next revision coming down six files at a time.
export function createGameActivity({ now = () => Date.now(), wait = pause } = {}) {
  const lastAsked = new Map();
  const quietFor = (id) => now() - (lastAsked.get(id) ?? -Infinity);

  return {
    asked(id) {
      lastAsked.set(id, now());
    },

    async untilQuiet(id) {
      for (let quiet = quietFor(id); quiet < QUIET_MS; quiet = quietFor(id)) {
        await wait(QUIET_MS - quiet);
      }
    },
  };
}
