import { describe, expect, it } from 'vitest';
import { drawsPatch, headMiddle, patchOf, readSheet } from '../../support/sheet-cells.js';

// Bug: the Sand Pharaoh changed as his strips changed. His swipe's arc was filled with a slab of grey
// left from its background, his staff lost its orb whenever he flinched or slammed, his head turned
// into a gaping beast's in his flinch, his walk slid him back and forth over his feet, and the sun
// over his staff jumped sideways each time the curse's loop began again
const { image, cellOf } = readSheet('pharaoh');
// his staff's orb and his face as his idle frame draws them, in that frame's pixels
const ORB = patchOf(image, cellOf('idle', 0), { x: 155, y: 84, width: 7, height: 5 });
const FACE = patchOf(image, cellOf('idle', 0), { x: 118, y: 80, width: 22, height: 15 });

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
      expect(drawsPatch(image, cellOf(strip, frame), ORB), `${strip} ${frame}`).toBe(true);
    }
  });

  it('keeps his own face as he flinches', () => {
    for (const frame of [0, 1, 2]) {
      expect(drawsPatch(image, cellOf('hurt', frame), FACE), `hurt ${frame}`).toBe(true);
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
