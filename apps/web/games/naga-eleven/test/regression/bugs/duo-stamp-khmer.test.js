import { describe, expect, it } from 'vitest';
import { SKILL_WORDS } from '../../../src/data/skill-words.js';
import { drawCutinStamp } from '../../../src/render/duel/cutin-stamp.js';
import { toCanvas } from '../../../src/render/duel/layout.js';
import { createPen } from '../../../src/render/duel/pen.js';
import { KHMER_MIN_SIZE } from '../../../src/render/text.js';
import { createRecordingContext } from '../../support/recording-context.js';

// The Khmer "គូ" under the DUO stamp was set at 12 px, small beside the stamp's big letters, and
// stood on the band's edge where it touched the move's name (TWIN) stamped below. It stands in the
// plate now, beside the English word, the size of the move's own Khmer name.

// the move's Khmer name under it is set at 24 px (cutin-names.js); the band starts at art row 34
const NAME_SIZE = 24;
const BAND_TOP = toCanvas(34);
// a Khmer line's marks reach about this far under the size it is set at
const KHMER_DEPTH = 1.3;

function stampCalls(tag, lang) {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 8 });
  drawCutinStamp(createPen(context, { unit: 3 }), {
    tag,
    option: { tag, move: 'twin-naga' },
    match: { combo: { level: 3 }, players: [] },
    side: 'attack',
    ticks: 40,
    tick: 100,
    lang,
  });

  return calls;
}

const fontOf = (calls, at) => calls.slice(0, at).findLast((call) => call.name === 'font').args[0];

const sizeOf = (font) => Number(font.match(/(\d+)px/)[1]);

function glossOf(tag) {
  const calls = stampCalls(tag, 'km');
  const word = SKILL_WORDS[tag === 'finisher' ? 'combo' : tag].km;
  const at = calls.findLastIndex((call) => call.name === 'fillText' && call.args[0] === word);

  return { y: calls[at].args[2], size: sizeOf(fontOf(calls, at)) };
}

describe('the Khmer word on a cut-in’s stamp', () => {
  it('is as big as the move’s Khmer name, and never under the Khmer minimum', () => {
    for (const tag of ['duo', 'chain', 'finisher']) {
      const { size } = glossOf(tag);

      expect(size, tag).toBe(NAME_SIZE);
      expect(size, tag).toBeGreaterThanOrEqual(KHMER_MIN_SIZE);
    }
  });

  it('keeps clear of the move’s name, above the band it is stamped in', () => {
    for (const tag of ['duo', 'chain', 'finisher']) {
      const { y, size } = glossOf(tag);

      expect(y + size * KHMER_DEPTH, tag).toBeLessThanOrEqual(BAND_TOP);
    }
  });

  it('is drawn only in Khmer', () => {
    const texts = stampCalls('duo', 'en').filter((call) => call.name === 'fillText');

    expect(texts).toEqual([]);
  });
});
