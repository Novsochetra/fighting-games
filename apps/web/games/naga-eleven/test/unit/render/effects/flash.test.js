import { describe, expect, it } from 'vitest';
import { EFFECT_COLOURS } from '../../../../src/art/actors.js';
import { VIEW } from '../../../../src/config.js';
import { LIFETIMES } from '../../../../src/render/effects/effect-list.js';
import { drawFlash } from '../../../../src/render/effects/flash.js';
import { createRecordingContext } from '../../../support/recording-context.js';

function washAt(effects, tick) {
  const { context, calls } = createRecordingContext();

  drawFlash(context, effects, tick);

  const fill = calls.find((call) => call.name === 'fillRect');
  const alpha = calls.find((call) => call.name === 'globalAlpha')?.args[0];

  return fill ? { alpha, colour: context.fillStyle, rect: fill.args } : null;
}

describe('the goal flash', () => {
  const effects = { flash: { born: 100 } };

  it('washes the whole view in the flash colour as the goal goes in', () => {
    const wash = washAt(effects, 100);

    expect(wash.colour).toBe(EFFECT_COLOURS.flash);
    expect(wash.rect).toEqual([0, 0, VIEW.width, VIEW.height]);
    expect(wash.alpha).toBeCloseTo(0.6);
  });

  it('fades out over its lifetime', () => {
    expect(washAt(effects, 100 + LIFETIMES.flash / 2).alpha).toBeLessThan(0.6);
    expect(washAt(effects, 100 + LIFETIMES.flash)).toBeNull();
    expect(washAt(effects, 99)).toBeNull();
    expect(washAt({ flash: null }, 100)).toBeNull();
  });

  it('waits unseen while a story scene holds the match', () => {
    expect(washAt({ ...effects, held: true }, 100)).toBeNull();
  });
});
