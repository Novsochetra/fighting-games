import { describe, expect, it } from 'vitest';
import { EFFECT_FRAMES } from '../../../../src/art/effect-kit.js';
import { KIT_FRAMES, kitFrame } from '../../../../src/render/effects/kit-frames.js';
import { paletteOf } from '../../../../src/render/effects/move-plan.js';
import { LOOK_ART } from '../../../../src/art/duel/looks.js';

const EFFECTS = ['comet', 'spiral', 'helix', 'ribbon', 'motes', 'blaze', 'star', 'shock'];
const CODES = new Set(Object.keys(paletteOf(LOOK_ART.naga)));

describe('the effects the kit paints', () => {
  it('has six frames of every effect and nothing else', () => {
    const wanted = EFFECTS.flatMap((effect) =>
      Array.from({ length: KIT_FRAMES }, (_, i) => `${effect}-${i + 1}`),
    );

    expect(Object.keys(EFFECT_FRAMES).sort()).toEqual(wanted.sort());
  });

  it.each(EFFECTS)('paints %s only in codes a look colours', (effect) => {
    for (let i = 0; i < KIT_FRAMES; i += 1) {
      const codes = new Set(kitFrame(effect, i).rows.join('').replaceAll('.', ''));

      expect(
        [...codes].every((code) => CODES.has(code)),
        `${effect} ${i}`,
      ).toBe(true);
    }
  });

  it('loops round to the first frame after the last', () => {
    expect(kitFrame('comet', KIT_FRAMES)).toBe(kitFrame('comet', 0));
  });

  it('has nothing for an effect it does not paint', () => {
    expect(kitFrame('nonsense', 0)).toBeNull();
  });
});
