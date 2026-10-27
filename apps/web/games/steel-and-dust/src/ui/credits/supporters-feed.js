import { readSupporterList } from './supporter-list.js';

// the arcade's own API, by address from the game's page, as Back to arcade finds the arcade
export const SUPPORTERS_ADDRESS = '../../api/supporters';

// the gifts the credits thank; `gifts` stays null until the list is in, and when the server and
// the offline copy both fail, so the credits thank everyone instead
export function createSupportersFeed(fetch) {
  const feed = {
    gifts: null,

    async load() {
      try {
        const response = await fetch(SUPPORTERS_ADDRESS);
        feed.gifts = response.ok ? readSupporterList(await response.json()) : feed.gifts;
      } catch {
        // offline with no copy kept: the credits roll without names
      }
    },
  };

  return feed;
}
