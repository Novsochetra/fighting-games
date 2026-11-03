import { describe, expect, it } from 'vitest';
import { SAVE_CAM } from '../../../src/data/save-cam.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import {
  endSaveCam,
  isSkillShot,
  saveCamAfterSave,
  saveCamBeforeGoal,
  saveCamTick,
} from '../../../src/sim/save-cam.js';
import { matchInPlay } from '../../support/match-driver.js';

// a skill's shot by team 0's forward at team 1's keeper, in a match someone watches
function skillShotAt({ watched = true, move = 'kouprey-kick', level = 0 } = {}) {
  const match = attachDuels(matchInPlay(), { watched });
  const keeper = Object.assign(match.players[11], { x: 1784, y: 560, dive: { tick: 0, side: 1 } });

  Object.assign(match.ball, { owner: null, x: 1790, y: 580, z: 28, kick: 'shot', lastTouch: 9 });
  match.lastShot = { shooter: 9, move, level, tick: match.tick };
  match.events.length = 0;

  return { match, keeper };
}

const save = (match, keeper, extra = {}) =>
  saveCamAfterSave(match, {
    keeper,
    result: 'saved',
    stretch: 0.5,
    skillShot: isSkillShot(match),
    ...extra,
  });

describe('the save cam in open play', () => {
  it('stops play for a skill’s shot the keeper saves, with the moment the show draws', () => {
    const { match, keeper } = skillShotAt();

    expect(save(match, keeper)).toBe(true);
    expect(match.phase).toBe('saveCam');
    expect(match.saveCam).toMatchObject({
      shooter: 9,
      keeper: keeper.index,
      move: 'kouprey-kick',
      result: 'saved',
      style: 'catch',
      dive: 1,
    });
    expect(match.saveCam.aim.side).toBeGreaterThan(0);
    expect(match.events.at(-1)).toEqual({ type: 'saveCam', moment: match.saveCam });
  });

  it('plays for a long combo, the keeper’s own skill or a great save, not for a plain one', () => {
    expect(save(skillShotAt({ move: null, level: SAVE_CAM.fromLevel }).match, null)).toBe(true);

    const plain = skillShotAt({ move: null });

    expect(save(plain.match, plain.keeper)).toBe(false);
    expect(save(plain.match, plain.keeper, { guard: 'panther-dive' })).toBe(true);

    const great = skillShotAt({ move: null });

    expect(save(great.match, great.keeper, { stretch: SAVE_CAM.stretchShare })).toBe(true);
  });

  it('never stops a match nobody watches, nor too soon after the last, nor too often a half', () => {
    const unwatched = skillShotAt({ watched: false });

    expect(save(unwatched.match, unwatched.keeper)).toBe(false);

    const { match, keeper } = skillShotAt();

    save(match, keeper);
    endSaveCam(match);
    expect(save(match, keeper)).toBe(false);

    match.tick += SAVE_CAM.gapTicks;
    match.saveCams.halves[0] = SAVE_CAM.mostPerHalf;
    expect(save(match, keeper)).toBe(false);
  });

  it('plays a skill’s goal first, then the goal phase as it ends', () => {
    const { match } = skillShotAt();

    match.ball.inGoal = 0;

    expect(saveCamBeforeGoal(match, 0)).toBe(true);
    expect(match.saveCam.result).toBe('goal');
    expect(match.score).toEqual([0, 0]);

    endSaveCam(match);

    expect(match.phase).toBe('goal');
    expect(match.score).toEqual([1, 0]);
  });

  it('plays on once the show ends it, or after a while if nothing does', () => {
    const { match, keeper } = skillShotAt();

    save(match, keeper);
    match.phaseTicks = SAVE_CAM.timeout - 1;
    saveCamTick(match);
    expect(match.phase).toBe('saveCam');

    match.phaseTicks = SAVE_CAM.timeout;
    saveCamTick(match);
    expect(match.phase).toBe('play');
    expect(match.saveCam).toBeNull();
    expect(endSaveCam(match)).toBe(false);
  });
});
