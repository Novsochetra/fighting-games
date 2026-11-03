import { describe, expect, it } from 'vitest';
import { HUD } from '../../../src/art/hud.js';
import { drawBigBanner } from '../../../src/render/hud/draw-banner.js';
import { createRecordingContext } from '../../support/recording-context.js';

// the GOAL banner waved its word one letter at a time, so in Khmer each vowel and sign was drawn
// alone and showed as a dotted circle
const KHMER_MARKS = /^[ា-៓៝]/;

function textsOfBanner(label, lang) {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 12 });
  drawBigBanner(
    context,
    { label, age: 30, length: Infinity, wave: true, ramp: HUD.gold },
    { lang },
  );

  return calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);
}

describe('the GOAL banner in Khmer', () => {
  it('draws its word whole, never a mark on its own', () => {
    const texts = textsOfBanner({ en: 'GOAL!', km: 'បាល់ចូល!' }, 'km');

    expect(texts).toContain('បាល់ចូល!');
    expect(texts.some((text) => KHMER_MARKS.test(text))).toBe(false);
  });

  it('still waves an English word letter by letter', () => {
    expect(textsOfBanner({ en: 'GOAL!', km: 'បាល់ចូល!' }, 'en')).toEqual(
      expect.arrayContaining(['G', 'O', 'A', 'L', '!']),
    );
  });
});
