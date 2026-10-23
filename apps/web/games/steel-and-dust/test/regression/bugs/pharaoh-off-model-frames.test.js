import { describe, expect, it } from 'vitest';
import { blobsOf, headMiddle, readSheet } from '../../support/sheet-cells.js';

// Bug: the Sand Pharaoh changed as his strips changed. His swipe's arc was filled with a slab of grey
// left from its background, his staff lost its orb whenever he flinched or slammed, his walk slid
// him back and forth over his feet, and the sun over his staff jumped sideways each time the
// curse's loop began again. (His flinch also wore a gaping beast's head; his first seven strips have
// since been redrawn whole after his skill art, the flinch with his own mask.)
const { image, cellOf } = readSheet('pharaoh');
// the orb is a round blue patch a few pixels across; the gems on his collar and belt are smaller
// and the rays of the slam's burst are long and thin
const ORB_ACROSS = [5, 8];
const ORB_PIXELS = 12;

const orbBlue = ([red, , blue]) => blue >= 150 && blue - red >= 80;
const across = (size) => size >= ORB_ACROSS[0] && size <= ORB_ACROSS[1];

function drawsOrb(cell) {
  return blobsOf(image, cell, orbBlue).some(
    ({ left, right, top, bottom, count }) =>
      count >= ORB_PIXELS && across(right - left + 1) && across(bottom - top + 1),
  );
}

function greyPixels(cell) {
  let count = 0;
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      const [red, green, blue] = image.rgb(cell.left + x, cell.top + y);
      const brightest = Math.max(red, green, blue);
      const grey = brightest - Math.min(red, green, blue) <= 12 && brightest >= 110;
      count += image.alpha(cell.left + x, cell.top + y) > 0 && grey && brightest <= 210 ? 1 : 0;
    }
  }
  return count;
}

// the middle of the blue sun burning over his staff, left to right
function sunMiddle(frame) {
  const cell = cellOf('curseOfSun', frame);
  let sum = 0;
  let count = 0;
  for (let y = 20; y < 70; y++) {
    for (let x = 0; x < cell.width; x++) {
      const [red, , blue] = image.rgb(cell.left + x, cell.top + y);
      if (image.alpha(cell.left + x, cell.top + y) > 0 && blue > 200 && red < 120) {
        sum += x;
        count++;
      }
    }
  }
  return sum / count;
}

describe('the Sand Pharaoh, strip to strip', () => {
  it('swings an arc with no grey slab inside it', () => {
    expect(greyPixels(cellOf('attack', 5))).toBeLessThanOrEqual(20);
  });

  it('keeps the orb in his staff as he flinches and slams', () => {
    const frames = [0, 1, 2, 3].map((frame) => ['hurt', frame]);
    frames.push(...[1, 2, 3, 4, 5, 6, 7, 8].map((frame) => ['slam', frame]));
    for (const [strip, frame] of frames) {
      expect(drawsOrb(cellOf(strip, frame)), `${strip} ${frame}`).toBe(true);
    }
  });

  it('walks with his body held over his feet', () => {
    const idle = headMiddle(image, cellOf('idle', 0), 30);
    for (let frame = 0; frame < 8; frame++) {
      const middle = headMiddle(image, cellOf('walk', frame), 30);
      expect(Math.abs(middle - idle), `walk ${frame}`).toBeLessThanOrEqual(3);
    }
  });

  it('holds the sun steady as the curse loops', () => {
    const loop = [4, 5, 6, 7, 4];
    for (let at = 1; at < loop.length; at++) {
      const step = Math.abs(sunMiddle(loop[at]) - sunMiddle(loop[at - 1]));
      expect(step, `${loop[at - 1]} to ${loop[at]}`).toBeLessThanOrEqual(3.5);
    }
  });
});
