import { difficultyOf } from '../../data/difficulty.js';
import { heroById } from '../../data/heroes.js';
import { formatClock } from '../../render/hud/clock.js';
import { boardPlace } from './menu-text.js';

const counted = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// every run that clears has crossed all twelve missions, which the title already says, so the
// tiles keep to what differs from one clear to the next
const STAT_TILES = [
  ['Time', (game) => formatClock(game.playTime)],
  ['Best combo', (game) => counted(game.records.bestCombo, 'hit', 'hits')],
  ['Leaderboard', (game) => boardPlace(game) || '—'],
  ['Continues', (game) => game.continues],
  ['Lives left', (game) => game.lives],
  ['Difficulty', (game) => difficultyOf(game.settings).name],
];

function heroHtml(game) {
  const hero = heroById(game.settings.hero);

  return `<p class="results-hero" style="--hero-color: var(--color-hero-${hero.id})">${hero.name}</p>`;
}

function scoreHtml(game) {
  const best = game.newBestScore ? '<span class="results-best">New best!</span>' : '';

  return (
    `<div class="results-score"><span class="results-label">Score</span>` +
    `<b>${game.score}</b>${best}</div>`
  );
}

// each tile takes its place in the order it rises in (--i)
function tilesHtml(game) {
  const tiles = STAT_TILES.map(
    ([name, value], i) => `<div style="--i: ${i}"><dt>${name}</dt><dd>${value(game)}</dd></div>`,
  );

  return `<dl class="results-tiles">${tiles.join('')}</dl>`;
}

// the run summed up once the last mission is clear: the Shade who won it, the score first and
// biggest, then the rest in a grid of tiles
export function clearResultsHtml(game) {
  return heroHtml(game) + scoreHtml(game) + tilesHtml(game);
}
