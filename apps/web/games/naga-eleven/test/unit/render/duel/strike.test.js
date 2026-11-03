import { describe, expect, it } from 'vitest';
import { CUTIN_FRAMES } from '../../../../src/art/cutin-art.js';
import { recipeFor } from '../../../../src/render/portraits/cast/index.js';
import { decodePart } from '../../../../src/render/portraits/kit/decode.js';
import { LEGEND } from '../../../../src/render/portraits/legend.js';
import {
  STRIKE_FRAMES,
  drawStrike,
  strikeFrameAt,
  strikesIn,
} from '../../../../src/render/duel/strike.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { createRecordingContext } from '../../../support/recording-context.js';

const SHOT = { kind: 'shot' };
const sochetra = { star: 'sochetra' };

describe('the strike a cut-in draws', () => {
  it('is Sochetra’s, for a shot he strikes alone', () => {
    expect(strikesIn({ striker: sochetra, partner: null }, SHOT)).toBe(true);
    expect(strikesIn({ striker: sochetra, partner: { star: 'rithy' } }, SHOT)).toBe(false);
    expect(strikesIn({ striker: sochetra, partner: null }, { kind: 'dribble' })).toBe(false);
    expect(strikesIn({ striker: { star: 'rafael' }, partner: null }, SHOT)).toBe(false);
  });

  it('runs through its frames once and holds the last', () => {
    const frames = Array.from({ length: 64 }, (_, ticks) => strikeFrameAt(ticks));

    expect(frames[0]).toBe(0);
    expect(new Set(frames).size).toBe(STRIKE_FRAMES);
    expect(frames.at(-1)).toBe(STRIKE_FRAMES - 1);
    expect(frames.every((frame, i) => i === 0 || frame >= frames[i - 1])).toBe(true);
  });

  it('has every frame in the portraits’ letters', () => {
    for (let i = 1; i <= STRIKE_FRAMES; i += 1) {
      const part = decodePart(CUTIN_FRAMES[`strike-${i}`]);

      expect(
        part.cells.filter(Boolean).every((letter) => LEGEND[letter]),
        `frame ${i}`,
      ).toBe(true);
    }
  });

  it('paints him in the skin, hair and shirt his portrait has', () => {
    const look = { character: 'sochetra', age: 'young', mood: 'shout' };
    const { palette } = recipeFor(look);
    const { context, calls } = createRecordingContext();
    const fills = new Set();

    context.fillRect = () => fills.add(context.fillStyle);
    drawStrike(createPen(context), { feet: { x: 50, y: 110 }, look, index: 3 });

    expect(calls.length).toBeGreaterThan(0);
    expect(fills.has(palette.skin)).toBe(true);
    expect(fills.has(palette.hair)).toBe(true);
    expect(fills.has(palette.cloth)).toBe(true);
  });
});
