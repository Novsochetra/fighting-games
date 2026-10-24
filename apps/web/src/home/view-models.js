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

export function monogramOf(title) {
  const [first = ''] = Array.from(asText(title).trim());
  return first.toLocaleUpperCase('en');
}

export function toGameCard(game) {
  return {
    id: asText(game.id),
    title: asText(game.title),
    monogram: monogramOf(game.title),
    href: game.path,
    coverSrc: isRelativeUrl(game.cover) ? game.cover : '',
  };
}

export function toGameCards(games) {
  return games.filter(isPlayableGame).map(toGameCard);
}

export function formatGameCount(count) {
  if (count === 0) {
    return 'No games yet';
  }
  return count === 1 ? '1 game' : `${count} games`;
}
