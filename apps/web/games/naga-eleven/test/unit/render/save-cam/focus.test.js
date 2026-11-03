import { describe, expect, it } from 'vitest';

import { createPen } from '../../../../src/render/duel/pen.js';
import { drawCamFocus, focusLight } from '../../../../src/render/save-cam/focus.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const LIGHT = [255, 251, 224];

const CENTRE = { x: 178, y: 50 };

// the lines alone on a black view, one canvas pixel an art pixel: where they lie and in what
function linesOn({ strength = 0.7, tick = 30 } = {}) {
  const canvas = createPixelCanvas(256, 144);
  const pen = createPen(canvas.getContext('2d'), { unit: 1 });
  const lit = [];

  pen.rect([0, 0, 256, 144], '#000000');
  drawCamFocus(pen, { centre: CENTRE, color: '#fffbe0', tick, strength });

  for (let i = 0; i < canvas.width * canvas.height; i += 1) {
    const colour = [...canvas.data.subarray(i * 4, i * 4 + 3)];

    if (colour.some((value) => value > 0)) {
      lit.push({ x: i % canvas.width, y: Math.floor(i / canvas.width), colour });
    }
  }

  return lit;
}

describe('the save cam’s focus lines', () => {
  it('are thin: a few hundredths of the view at the most', () => {
    for (const tick of [20, 21, 30, 31, 38]) {
      const lit = linesOn({ tick });

      expect(lit.length, `${tick}`).toBeGreaterThan(100);
      expect(lit.length, `${tick}`).toBeLessThan(256 * 144 * 0.05);
    }
  });

  it('leave the aim and what stands round it clear', () => {
    for (const { x, y } of linesOn()) {
      expect(Math.hypot(x - CENTRE.x, y - CENTRE.y)).toBeGreaterThan(60);
    }
  });

  it('are the light they are given, the venue showing through it', () => {
    for (const { colour } of linesOn()) {
      colour.forEach((value, i) => {
        expect(value).toBeLessThan(LIGHT[i] * 0.6 + 1);
        expect(value).toBeGreaterThan(LIGHT[i] * 0.5 - 1);
      });
    }
  });

  it('grow in number as the ball flies, and are not there before it does', () => {
    expect(linesOn({ strength: 0 })).toEqual([]);
    expect(linesOn({ strength: 0.2 }).length).toBeLessThan(linesOn({ strength: 0.7 }).length);
  });
});

describe('the focus lines’ light by the sky behind the goal', () => {
  const body = ['#3a1a08', '#8a4a14', '#e08a2a', '#ffd070', '#fffbe0'];

  it('is the move’s light over a bright sky, and stronger than over a night one', () => {
    expect(focusLight(body, 'day').color).toBe(body[3]);
    expect(focusLight(body, 'day').show).toBeGreaterThan(focusLight(body, 'night').show);
  });

  it('is that light halfway to the move’s palest over a night stand', () => {
    expect(focusLight(body, 'night').color).toBe('#ffe6a8');
    expect(focusLight(body, undefined)).toEqual(focusLight(body, 'night'));
  });
});
