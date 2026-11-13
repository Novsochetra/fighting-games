import { hash } from '../../../../../../src/render/duel/hash.js';
import { crashFigure } from './crash.js';
import { isGold, lightened, whiteHot } from './light.js';
import { ENERGY, pixelWriter } from './pixels.js';
import { motionsOf, shardStates } from './shards.js';

// pixels a tick, running ahead of the break
const CRACKING = 16;

// the Naga is still seen in its own colours as it breaks, before its shards turn to light
const LIT_AFTER = 5;

const FADING = [ENERGY.emerald[4], ENERGY.emerald[3], ENERGY.emerald[2]];

const GOLD_FADING = [ENERGY.gold[3], ENERGY.gold[2], ENERGY.gold[1]];

const fadedOf = (word, crumble) =>
  (isGold(word) ? GOLD_FADING : FADING)[Math.floor(crumble * 2.99)];

function sparkOf(pixel, { crumble, x, y }) {
  const seed = (salt) => hash(pixel.x, pixel.y, salt);
  const step = Math.ceil(crumble * 8) / 8;

  if (seed(74) < step || seed(75) > Math.max(0.3, 1 - step * 4)) {
    return null;
  }

  const angle = seed(71) * Math.PI * 2;
  const reach = crumble * (4 + 12 * seed(72));

  return {
    x: x + Math.cos(angle) * reach,
    y: y + Math.sin(angle) * reach * 0.6 - crumble ** 1.5 * (14 + 22 * seed(73)),
    color: crumble < 0.12 ? lightened(pixel.color) : fadedOf(pixel.color, crumble),
  };
}

function wholeColour(pixel, { broken, frame }) {
  if (broken.hot) {
    return whiteHot(pixel.color);
  }

  if (pixel.crack && pixel.reach < (broken.since - 2) * CRACKING) {
    return frame % 4 < 2 ? ENERGY.flash : ENERGY.gold[3];
  }

  return pixel.color;
}

function flyingColour(pixel, state) {
  if (pixel.crack) {
    return ENERGY.flash;
  }

  return state.ticks > LIT_AFTER ? lightened(pixel.color) : pixel.color;
}

function shownPixel(pixel, { state, broken, frame }) {
  if (state.ticks <= 0) {
    return { x: pixel.x, y: pixel.y, color: wholeColour(pixel, { broken, frame }) };
  }

  const x = pixel.x + state.dx;
  const y = pixel.y + state.dy;

  if (state.crumble <= 0) {
    return { x, y, color: flyingColour(pixel, state) };
  }

  return sparkOf(pixel, { crumble: state.crumble, x, y });
}

// `broken` is tracks/serpent.js's breakAt
export function drawBurst(sheet, { ending, broken, frame }) {
  const crash = crashFigure(ending);
  const states = shardStates(motionsOf(crash, ending), broken);
  const writer = pixelWriter(sheet);

  crash.pixels.forEach((pixel) => {
    const shown = shownPixel(pixel, { state: states[pixel.shard], broken, frame });

    if (shown) {
      writer.plot(shown.x, shown.y, shown.color);
    }
  });
  writer.done();
}
