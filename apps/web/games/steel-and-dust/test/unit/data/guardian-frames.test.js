import { describe, expect, it } from 'vitest';
import { ENEMY_MOVES } from '../../../src/data/enemies/enemy-moves.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { moveLength } from '../../../src/data/moves/define-move.js';
import { timelineFrame } from '../../../src/sim/enemy-animation.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const sprite = ENEMY_SPRITES.guardian;
const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));

// the frames where a move leaves his stance or comes back to it
const STANCE_FRAMES = [
  ['attack', 0],
  ['attack', 8],
  ['slam', 0],
  ['slam', 8],
  ['stoneGaze', 0],
  ['stoneGaze', 7],
  ['figRoots', 0],
  ['figRoots', 7],
  ['fourFaces', 0],
  ['fourFaces', 11],
  ['crumble', 0],
];
// his breath only reaches down to his belt
const BELOW_BELT = 124;

const origin = (strip, frame) => ({
  left: frame * sprite.frameWidth,
  top: sprite.strips[strip].row * sprite.frameHeight,
});

const pixelAt = ({ left, top }, x, y) =>
  [sheet.alpha(left + x, top + y), ...sheet.rgb(left + x, top + y)].join();

const solidAt = ({ left, top }, x, y) => sheet.alpha(left + x, top + y) > 0;

function differingRows(first, second, { fromRow = 0, read = pixelAt } = {}) {
  const rows = [];
  for (let y = fromRow; y < sprite.frameHeight; y++) {
    for (let x = 0; x < sprite.frameWidth; x++) {
      if (read(first, x, y) !== read(second, x, y)) {
        rows.push(y);
        break;
      }
    }
  }
  return rows;
}

// each strip was drawn by itself, at its own size and place: a move that began on a body other than
// the one he idles in made him jump and swell as it started
describe("the Bayon Guardian's frames", () => {
  it('leave and come back to his stance on the very frame he idles on', () => {
    const idle = origin('idle', 0);
    for (const [strip, frame] of STANCE_FRAMES) {
      expect(differingRows(idle, origin(strip, frame)), `${strip} ${frame}`).toEqual([]);
    }
  });

  // his veins pulse as he breathes, so only where he is drawn is compared
  it('breathe in his idle loop without shuffling his feet or fists', () => {
    const first = origin('idle', 0);
    const below = { fromRow: BELOW_BELT, read: solidAt };
    for (let frame = 1; frame < sprite.strips.idle.frames; frame++) {
      expect(differingRows(first, origin('idle', frame), below), `idle ${frame}`).toEqual([]);
    }
  });

  // the Four Faces once held one frame in place of a frame drawn wrong, then skipped two
  it('play every frame of the Four Faces strip, in order', () => {
    const move = ENEMY_MOVES.fourFaces;
    const shown = new Set();
    for (let tick = 0; tick < moveLength(move); tick++) {
      shown.add(timelineFrame(move, tick));
    }
    const strip = sprite.strips.fourFaces.frames;
    expect([...shown]).toEqual(Array.from({ length: strip }, (_, frame) => frame));
  });
});
