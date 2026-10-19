export const MIN_SHELF_SLOTS = 4;

// Only plain relative paths: the catalog is data, and a "javascript:" or "//host" href must never
// become a link on the page.
const RELATIVE_URL_PATTERN = /^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*\/?$/;

const asText = (value) => (typeof value === 'string' ? value : '');

export function isRelativeUrl(value) {
  return typeof value === 'string' && RELATIVE_URL_PATTERN.test(value);
}

export function isPlayableGame(game) {
  return Boolean(game) && isRelativeUrl(game.path) && asText(game.title).trim() !== '';
}

export function toGameCard(game) {
  return {
    id: asText(game.id),
    title: asText(game.title),
    tagline: asText(game.tagline),
    description: asText(game.description),
    genre: asText(game.genre),
    players: asText(game.players),
    href: game.path,
    coverSrc: isRelativeUrl(game.cover) ? game.cover : '',
    controls: Array.isArray(game.controls)
      ? game.controls.filter((control) => typeof control === 'string' && control !== '')
      : [],
  };
}

export function buildShelf(games, minSlots = MIN_SHELF_SLOTS) {
  const cards = games.filter(isPlayableGame).map(toGameCard);
  return { cards, emptySlotCount: Math.max(0, minSlots - cards.length) };
}

export function formatGameCount(count) {
  if (count === 0) {
    return 'No games yet';
  }
  return count === 1 ? '1 game' : `${count} games`;
}
