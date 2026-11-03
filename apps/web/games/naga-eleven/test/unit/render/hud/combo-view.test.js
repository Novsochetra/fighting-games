import { describe, expect, it } from 'vitest';
import { PASS_COMBO } from '../../../../src/data/combos.js';
import { createEffects } from '../../../../src/render/effects/index.js';
import { BREAK_TICKS, counterView } from '../../../../src/render/hud/combo-view.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

function sideAt(fields) {
  const match = fixtureMatch();
  const effects = createEffects();

  Object.assign(effects.combos[0], fields);

  return { match, effects };
}

describe("a side's combo counter", () => {
  it('shows nothing at x1, and from x2 the level in its shirt, gold from x3', () => {
    const at = (level) => {
      const { match, effects } = sideAt({ level, climbedAt: 0 });

      return counterView(effects, match, 0);
    };

    expect(at(1)).toBeNull();
    expect(at(2)).toMatchObject({ level: 2, mode: 'side', live: true });
    expect(at(3)).toMatchObject({ level: 3, mode: 'gold' });
  });

  it('pops the number a cell bigger as it climbs, then settles', () => {
    const { match, effects } = sideAt({ level: 2, climbedAt: 600 });

    expect(counterView(effects, match, 0, 601).cell).toBe(4);
    expect(counterView(effects, match, 0, 610).cell).toBe(3);
  });

  it('drains its bar over the hold since the last touch', () => {
    const { match, effects } = sideAt({ level: 2, climbedAt: 0 });
    const hold = PASS_COMBO.holdTicks[match.format];

    match.combo = { team: 0, level: 2, holder: 3, since: 600, passer: 2 };

    expect(counterView(effects, match, 0, 600).hold).toBe(1);
    expect(counterView(effects, match, 0, 600 + hold / 2).hold).toBeCloseTo(0.5);
    expect(counterView(effects, match, 0, 600 + hold * 2).hold).toBe(0);
  });

  it('shakes and greys out a broken combo, and is gone after', () => {
    const { match, effects } = sideAt({ level: 0, endLevel: 3, endedAt: 600 });

    expect(counterView(effects, match, 0, 601)).toMatchObject({ mode: 'gold', live: false });
    expect(Math.abs(counterView(effects, match, 0, 601).shake)).toBe(2);
    expect(counterView(effects, match, 0, 606).mode).toBe('grey');
    expect(counterView(effects, match, 0, 600 + BREAK_TICKS)).toBeNull();
  });

  it('bursts into sparks when a finisher spent it', () => {
    const { match, effects } = sideAt({ level: 0, endLevel: 3, endedAt: 600, endBurst: true });

    expect(counterView(effects, match, 0, 604)).toMatchObject({ burst: 4, mode: 'gold' });
  });
});
