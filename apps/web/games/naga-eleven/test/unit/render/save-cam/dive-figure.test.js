import { describe, expect, it } from 'vitest';

import { DIVE_INKS } from '../../../../src/art/save-cam/keeper-dive/index.js';
import { colourOf, drawDiveFigure } from '../../../../src/render/save-cam/dive-figure.js';

const LOOK = {
  shirt: ['#100000', '#200000', '#300000', '#400000'],
  shorts: ['#001000', '#002000', '#003000'],
  socks: ['#000010', '#000020', '#000030', '#000040'],
  trim: ['#111111', '#222222', '#333333', '#444444'],
  skin: ['#510000', '#520000', '#530000', '#540000'],
  hair: ['#000051', '#000052', '#000053', '#000054'],
  numberColours: { fill: '#abcdef', edge: '#fedcba' },
};

// a pen that keeps every art pixel it is asked to paint, by its place
function recordingPen() {
  const pixels = new Map();
  const rect = ([left, top, width, height], color) => {
    for (let y = top; y < top + height; y += 1) {
      for (let x = left; x < left + width; x += 1) {
        pixels.set(`${x},${y}`, color);
      }
    }
  };

  return { pixels, rect, dot: (x, y, color) => rect([x, y, 1, 1], color) };
}

// a chest of shirt, a sleeve of skin to its left and an outline round it, its navel at 4, 6
const CHEST = {
  anchor: { x: 4, y: 6 },
  hands: { x: 0, y: 0 },
  number: { x: 5, y: 4 },
  rows: [
    '0000000000',
    '0tccccccc0',
    '0tccccccc0',
    '0tccccccc0',
    '0tccccccc0',
    '0tccccccc0',
    '0tccccccc0',
    '0tccccccc0',
    '0000000000',
  ],
};

describe("the dive's pixel maps, drawn", () => {
  it("wears the keeper's own ramps, a short ramp shade for shade along it", () => {
    expect(colourOf('a', LOOK)).toBe('#100000');
    expect(colourOf('d', LOOK)).toBe('#400000');
    expect(colourOf('e', LOOK)).toBe('#001000');
    expect(colourOf('h', LOOK)).toBe('#003000');
    expect(colourOf('u', LOOK)).toBe('#530000');
    expect(colourOf('0', LOOK)).toBe(DIVE_INKS[0]);
    expect(colourOf('J', LOOK)).toBe(DIVE_INKS.J);
  });

  it('puts its navel where it is told, and reads the map from the right diving left', () => {
    const right = recordingPen();
    const left = recordingPen();

    drawDiveFigure(right, { map: CHEST, x: 50, y: 20, look: LOOK });
    drawDiveFigure(left, { map: CHEST, x: 50, y: 20, mirror: true, look: LOOK });

    expect(right.pixels.get('50,20')).toBe('#300000');
    expect(right.pixels.get('47,15')).toBe('#520000');
    expect(left.pixels.get('53,15')).toBe('#520000');
    expect(left.pixels.get('47,15')).toBe('#300000');
  });

  it("rings his number in the shirt's own shade, on the shirt only", () => {
    const pen = recordingPen();

    drawDiveFigure(pen, { map: CHEST, x: 4, y: 6, look: LOOK, number: 1 });

    const ringed = [...pen.pixels].filter(([, colour]) => colour === '#fedcba').map(([at]) => at);

    expect(ringed).toContain('4,2');
    expect(ringed).toContain('6,4');
    expect(ringed.every((at) => Number(at.split(',')[0]) >= 2)).toBe(true);
  });

  it('prints his number on the shirt the right way round, either way he dives', () => {
    for (const mirror of [false, true]) {
      const pen = recordingPen();

      drawDiveFigure(pen, { map: CHEST, x: 4, y: 6, mirror, look: LOOK, number: 1 });

      const inked = [...pen.pixels].filter(([, colour]) => colour === '#abcdef').map(([at]) => at);
      const middle = mirror ? 3 : 5;

      expect(inked, String(mirror)).toHaveLength(6);
      expect(inked, String(mirror)).toContain(`${middle - 1},3`);
      expect(inked, String(mirror)).not.toContain(`${middle - 1},2`);
      expect(inked, String(mirror)).toContain(`${middle},2`);
    }
  });

  it('prints no number where there is no shirt, and none for a player without one', () => {
    const sleeve = { ...CHEST, number: { x: 1, y: 4 } };
    const pen = recordingPen();
    const bare = recordingPen();

    drawDiveFigure(pen, { map: sleeve, x: 4, y: 6, look: LOOK, number: 1 });
    drawDiveFigure(bare, { map: CHEST, x: 4, y: 6, look: LOOK });

    const inkedAt = (recorded) =>
      [...recorded.pixels].filter(([, colour]) => colour === '#abcdef').map(([at]) => at);

    expect(inkedAt(pen).every((at) => Number(at.split(',')[0]) >= 2)).toBe(true);
    expect(inkedAt(bare)).toEqual([]);
  });
});
