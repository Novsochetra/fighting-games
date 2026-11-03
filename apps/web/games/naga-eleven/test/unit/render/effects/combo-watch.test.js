import { describe, expect, it } from 'vitest';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

function tickWith(effects, match, events = []) {
  match.tick += 1;
  match.events = events;
  updateEffects(effects, match, {});
  match.events = [];
}

const climb = (team, level, player = 3) => ({ type: 'combo', team, level, player });

describe('the combo a side builds, as the HUD follows it', () => {
  it('climbs with each step and pops the new level on the passer from x2, the last only', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    tickWith(effects, match, [climb(0, 2, 4)]);
    tickWith(effects, match, [climb(0, 3, 5)]);

    expect(effects.combos[0]).toMatchObject({ level: 3, climbedAt: match.tick });
    expect(effects.pops.map((pop) => [pop.player, pop.level])).toEqual([[5, 3]]);
  });

  it('keeps how a combo ended, and bursts it when a finisher spent it, in either order', () => {
    const match = fixtureMatch();
    const effects = createEffects();
    const end = { type: 'comboEnd', team: 0, level: 3, reason: 'shot' };
    const finisher = { type: 'special', player: 9, move: 'mekong-current' };

    tickWith(effects, match, [climb(0, 3)]);
    tickWith(effects, match, [{ type: 'comboEnd', team: 0, level: 3, reason: 'lost' }]);

    expect(effects.combos[0]).toMatchObject({ level: 0, endLevel: 3, endBurst: false });

    tickWith(effects, match, [climb(0, 3)]);
    tickWith(effects, match, [finisher, end]);

    expect(effects.combos[0].endBurst).toBe(true);

    tickWith(effects, match, [climb(0, 3)]);
    tickWith(effects, match, [end, finisher]);

    expect(effects.combos[0].endBurst).toBe(true);
  });

  it("follows the match's own combo when it keeps one, though no event told", () => {
    const match = fixtureMatch();
    const effects = createEffects();

    match.combo = { team: 1, level: 2, holder: 15, since: match.tick, passer: 14, before: 13 };
    tickWith(effects, match);

    expect(effects.combos[1].level).toBe(2);
    expect(effects.pops).toMatchObject([{ player: 14, level: 2 }]);

    match.combo = null;
    tickWith(effects, match);

    expect(effects.combos[1]).toMatchObject({ level: 0, endLevel: 2, reason: 'lost' });
  });

  it('holds a climb and an end behind a cut-in until play goes on, so they are seen', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    tickWith(effects, match, [climb(0, 3)]);
    match.phase = 'duel';
    tickWith(effects, match, [{ type: 'comboEnd', team: 0, level: 3, reason: 'shot' }]);

    for (let i = 0; i < 90; i += 1) {
      tickWith(effects, match);
    }

    expect(effects.combos[0].endedAt).toBe(match.tick);
  });

  it('remembers the passes of a combo for its river until the combo breaks', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    tickWith(effects, match, [{ type: 'pass', player: 4 }]);
    tickWith(effects, match, [{ type: 'pass', player: 5 }]);

    expect(effects.passes[0]).toHaveLength(2);

    tickWith(effects, match, [{ type: 'comboEnd', team: 0, level: 2, reason: 'lost' }]);

    expect(effects.passes[0]).toEqual([]);
  });
});
