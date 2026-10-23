import { describe, expect, it } from 'vitest';
import { blobsOf, readSheet } from '../../support/sheet-cells.js';

// Bug: once the Furnace Knight was redrawn as pixel art, his fire got the dark outline meant for his
// armour, so flames ended in a black line; specks of the grey his first images were painted on
// stayed in the fire, the flail's sweep along the road carried a charred lump behind his foot, and
// his swings' flame trails were streaked with washed-out white and peach that did not read as fire
const { sprite, image, cellOf } = readSheet('furnace');
const FIRE_STRIPS = ['attack', 'fireFlail', 'slagPot', 'meltdown'];
// the slam's explosion throws rocks through its fire, and their grey highlights belong there
const OUTLINED_STRIPS = [...FIRE_STRIPS, 'slam'];
const MOST_PER_FRAME = 4;
const SWEEP = ['fireFlail', 6];
const REACH = 2;
const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const drawn = (cell, x, y) =>
  x >= 0 &&
  y >= 0 &&
  x < cell.width &&
  y < cell.height &&
  image.alpha(cell.left + x, cell.top + y) > 0;
const colorAt = (cell, x, y) => image.rgb(cell.left + x, cell.top + y);
const isFire = ([red, , blue]) => red >= 190 && blue <= 120 && red - blue >= 110;
const isBlack = (rgb) => Math.max(...rgb) < 60;
const isGrey = (rgb) => Math.max(...rgb) - Math.min(...rgb) <= 16 && Math.max(...rgb) >= 110;
// pale and nearly colourless: white or peach, where fire runs from red at its edge to yellow
const isWashed = (rgb) =>
  Math.max(...rgb) > 170 && (Math.max(...rgb) - Math.min(...rgb)) / Math.max(...rgb) < 0.4;

// the share of the drawn pixels round a pixel that are fire
function fireAround(cell, x, y) {
  let fire = 0;
  let seen = 0;
  for (let dy = -REACH; dy <= REACH; dy++) {
    for (let dx = -REACH; dx <= REACH; dx++) {
      if (drawn(cell, x + dx, y + dy)) {
        seen++;
        fire += isFire(colorAt(cell, x + dx, y + dy)) ? 1 : 0;
      }
    }
  }
  return fire / seen;
}

const onEdge = (cell, x, y) => NEIGHBOURS.some(([dx, dy]) => !drawn(cell, x + dx, y + dy));
// the dark brown of his armour and of the rocks his slam throws, whose own outline is black
const isBody = (rgb) => !isFire(rgb) && Math.max(...rgb) >= 60 && Math.max(...rgb) < 130;
const touchesBody = (cell, x, y) =>
  NEIGHBOURS.some(
    ([dx, dy]) => drawn(cell, x + dx, y + dy) && isBody(colorAt(cell, x + dx, y + dy)),
  );

function countInFire(cell, isWrong, share) {
  let count = 0;
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      const wrong = drawn(cell, x, y) && isWrong(cell, x, y);
      count += wrong && fireAround(cell, x, y) >= share ? 1 : 0;
    }
  }
  return count;
}

const blackRim = (cell, x, y) =>
  onEdge(cell, x, y) && isBlack(colorAt(cell, x, y)) && !touchesBody(cell, x, y);
const greySpeck = (cell, x, y) =>
  isGrey(colorAt(cell, x, y)) && Math.max(...colorAt(cell, x, y)) <= 235;

function eachFrame(strips, check) {
  for (const strip of strips) {
    for (let frame = 0; frame < sprite.strips[strip].frames; frame++) {
      check(cellOf(strip, frame), `${strip} ${frame}`);
    }
  }
}

describe("the Furnace Knight's fire", () => {
  it('ends in flame, not in a black line', () => {
    eachFrame(OUTLINED_STRIPS, (cell, label) => {
      expect(countInFire(cell, blackRim, 0.5), label).toBeLessThanOrEqual(MOST_PER_FRAME);
    });
  });

  it('keeps no grey specks of a background in it', () => {
    eachFrame(FIRE_STRIPS, (cell, label) => {
      expect(countInFire(cell, greySpeck, 0.3), label).toBeLessThanOrEqual(MOST_PER_FRAME);
    });
  });

  it('burns red, orange and yellow, with no washed-out streaks', () => {
    eachFrame(OUTLINED_STRIPS, (cell, label) => {
      const washed = (part, x, y) => isWashed(colorAt(part, x, y));
      expect(countInFire(cell, washed, 0.25), label).toBeLessThanOrEqual(MOST_PER_FRAME);
    });
  });

  it('sweeps along the road with nothing dark in it but him and his flail', () => {
    const dark = blobsOf(image, cellOf(...SWEEP), (rgb) => Math.max(...rgb) < 70);
    expect(dark.filter(({ count }) => count >= 20)).toHaveLength(1);
  });
});
