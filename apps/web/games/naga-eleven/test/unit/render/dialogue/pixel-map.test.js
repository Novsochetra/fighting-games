import { describe, expect, it } from 'vitest';
import { ART_KEYS } from '../../../../src/art/dialogue/palette.js';
import { arrowShown } from '../../../../src/render/dialogue/cues.js';
import { ART, drawPixelMap } from '../../../../src/render/dialogue/pixel-map.js';
import { createRecordingContext } from '../../../support/recording-context.js';

const rectsOf = (calls) =>
  calls.filter((call) => call.name === 'fillRect').map((call) => call.args);

describe('a pixel map', () => {
  it('is laid as a rect a run of one colour, an art pixel deep', () => {
    const { context, calls } = createRecordingContext();

    drawPixelMap(context, ['oo4.', '..44'], { x: 10, y: 20, colors: ART_KEYS });

    expect(rectsOf(calls)).toEqual([
      [10, 20, 2 * ART, ART],
      [10 + 2 * ART, 20, ART, ART],
      [10 + 2 * ART, 20 + ART, 2 * ART, ART],
    ]);
  });

  it('turns round for the far side', () => {
    const { context, calls } = createRecordingContext();

    drawPixelMap(context, ['o...'], { x: 0, y: 0, colors: ART_KEYS, flipX: true });

    expect(rectsOf(calls)).toEqual([[3 * ART, 0, ART, ART]]);
  });

  it('keeps every colour it is drawn in in the art', () => {
    const { context, calls } = createRecordingContext();

    drawPixelMap(context, ['o012345abcdefklmnpvwxyz'], { x: 0, y: 0, colors: ART_KEYS });

    const colors = calls.filter((call) => call.name === 'fillStyle').map((call) => call.args[0]);

    expect(colors.every((color) => /^#[0-9a-f]{6}$/.test(color))).toBe(true);
  });
});

describe('the next arrow', () => {
  it('blinks, shown longer than hidden', () => {
    const shown = Array.from({ length: 120 }, (_, tick) => arrowShown(tick));

    expect(shown.filter(Boolean).length).toBeGreaterThan(60);
    expect(shown.includes(false)).toBe(true);
  });
});
