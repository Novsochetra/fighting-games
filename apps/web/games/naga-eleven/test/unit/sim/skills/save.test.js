import { describe, expect, it } from 'vitest';
import { SKILL_PLAY } from '../../../../src/data/skills.js';
import { saveStyleOf, skillReachOf, skillSave } from '../../../../src/sim/skills/save.js';
import { diveReachOf } from '../../../../src/sim/stats.js';
import { matchInPlay } from '../../../support/match-driver.js';

function shotAtKeeper({ dive = { tick: 0, side: 1 }, spirit = 60, skill = 'bayon-eyes' } = {}) {
  const match = matchInPlay();
  const keeper = Object.assign(match.players[0], { x: 16, y: 540, dive, spirit, skill });

  Object.assign(match.ball, {
    owner: null,
    x: 40,
    y: 570,
    z: 10,
    vx: -10,
    vy: 1,
    lastTouch: 20,
    kick: 'shot',
  });
  match.events.length = 0;

  return { match, keeper };
}

describe('a keeper’s save skill', () => {
  it('reaches further than his own dive, only in a dive and with the spirit for it', () => {
    const { match, keeper } = shotAtKeeper();
    const dive = diveReachOf(keeper, match.goal);

    expect(skillReachOf(match, keeper, dive)).toBeCloseTo(dive * SKILL_PLAY.save.reach);
    expect(skillReachOf(match, { ...keeper, dive: null }, dive)).toBe(dive);
    expect(skillReachOf(match, { ...keeper, spirit: 2 }, dive)).toBe(dive);
  });

  it('keeps the ball out the keeper’s way: a catch, a punch or a wall', () => {
    expect(saveStyleOf('bayon-eyes')).toBe('catch');
    expect(saveStyleOf('mountain-guard')).toBe('punch');
    expect(saveStyleOf('angkor-wall')).toBe('wall');
    expect(saveStyleOf(null)).toBe('catch');
  });

  it('fires, is paid, and a wall sends the ball back the way it came', () => {
    const { match, keeper } = shotAtKeeper({ skill: 'belly-block' });
    const saved = skillSave(match, keeper);

    expect(saved).toEqual({ held: false, guard: 'belly-block', style: 'wall' });
    expect(match.ball.vx).toBeGreaterThan(0);
    expect(match.events[0]).toEqual({ type: 'skill', player: 0, move: 'belly-block' });
    expect(keeper.spirit).toBeLessThan(60);
  });
});
