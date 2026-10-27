import { isLastMission } from '../../data/missions/index.js';
import { isFightOver } from '../../sim/stage/loot-time.js';
import { readSupporterList } from './supporter-list.js';

// the arcade's own API, by address from the game's page, as Back to arcade finds the arcade
export const SUPPORTERS_ADDRESS = '../../api/supporters';

// the gifts the credits thank; `gifts` stays null until the list is in, and when the server and
// the offline copy both fail, so the credits thank everyone instead
export function createSupportersFeed(fetch) {
  let ending = false;

  const feed = {
    gifts: null,

    async load() {
      try {
        const response = await fetch(SUPPORTERS_ADDRESS);
        feed.gifts = response.ok ? readSupporterList(await response.json()) : feed.gifts;
      } catch {
        // offline with no copy kept: the credits roll with the list read before, if any
      }
    },

    // a run lasts the best part of an hour, so the list is read again as the last boss falls and a
    // gift made meanwhile rolls too; the loot time and the clear give it ten seconds or more
    followRun(game) {
      const endingNow = isLastMission(game.missionIndex) && isFightOver(game);

      if (endingNow && !ending) {
        feed.load();
      }

      ending = endingNow;
    },
  };

  return feed;
}
