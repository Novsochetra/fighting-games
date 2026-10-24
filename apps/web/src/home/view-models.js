// Only plain relative paths: the catalog is data, and a "javascript:" or "//host" href must never
// become a link on the page.
const RELATIVE_URL_PATTERN = /^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*\/?$/;
const SENTENCE_END = /[.!?](?=\s|$)/;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');
const asUrl = (value) => (isRelativeUrl(value) ? value : '');

export function isRelativeUrl(value) {
  return typeof value === 'string' && RELATIVE_URL_PATTERN.test(value);
}

export function isPlayableGame(game) {
  return Boolean(game) && isRelativeUrl(game.path) && asText(game.title) !== '';
}

// A game hosted on its own site opens its url, but only a secure web address: the catalog is data.
export function isSecureGameUrl(value) {
  if (typeof value !== 'string' || /\s/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

const playHrefOf = (game) => (isSecureGameUrl(game.url) ? game.url : game.path);

export function monogramOf(title) {
  const [first = ''] = Array.from(asText(title));
  return first.toLocaleUpperCase('en');
}

export function firstSentence(text) {
  const value = asText(text);
  const end = SENTENCE_END.exec(value);
  return end ? value.slice(0, end.index + 1) : value;
}

export function metaLine({ genre, players, year }) {
  const yearText = Number.isInteger(year) ? String(year) : '';
  return [asText(genre), asText(players), yearText].filter((part) => part !== '').join(' · ');
}

function controlsOf(game) {
  return Array.isArray(game.controls) ? game.controls.map(asText).filter(Boolean) : [];
}

export function toGameCard(game) {
  const coverSrc = asUrl(game.cover);
  const bannerSrc = asUrl(game.banner) || coverSrc;
  return {
    id: asText(game.id),
    title: asText(game.title),
    monogram: monogramOf(game.title),
    href: playHrefOf(game),
    // Pixel art scales up block by block; rendered art such as a 3D world must stay smooth.
    smoothArt: game.pixelArt === false,
    coverSrc,
    bannerSrc,
    posterSrc: asUrl(game.poster) || bannerSrc,
    // A frame of play on the card, so it shows the game rather than the key art behind it.
    artSrc: asUrl(game.screenshot) || bannerSrc,
    genre: asText(game.genre),
    meta: metaLine(game),
    summary: firstSentence(game.description),
    description: asText(game.description),
    controls: controlsOf(game),
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
