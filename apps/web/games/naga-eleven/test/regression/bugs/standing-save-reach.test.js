import { describe, expect, it } from 'vitest';

import { KEEPER_SHARE, shotPoint } from '../../../src/render/save-cam/flight.js';
import { keeperPose } from '../../../src/render/save-cam/keeper-pose.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { contactTick } from '../../../src/render/save-cam/timing.js';
import { project } from '../../../src/render/save-cam/view.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { midY } from '../../../src/sim/pitch.js';
import { isSkillShot, saveCamAfterSave } from '../../../src/sim/save-cam.js';
import { matchInPlay } from '../../support/match-driver.js';

// In open play a keeper off to one side of his goal who took the ball standing comes to the cam
// with no dive, and the cam draws him in the middle of the goal: he parried a ball that passed 35
// art pixels beside his gloves (the village friendly: the contact at x 92.6, his gloves at 128;
// one open-play save cam in 22). A keeper who keeps the ball out now reaches it; one standing
// still is one the ball comes at
const VILLAGE = { result: 'parried', aim: { side: -0.368, height: 0.3 }, dive: 0, style: 'catch' };

const REACH = 12;

// how far his gloves are from the ball as it meets him
function missBy(raw) {
  const moment = camMoment({ shooter: 9, keeper: 11, ...raw }, 3);
  const gloves = keeperPose(moment, contactTick()).gloves;

  return Math.abs(gloves.x - project(shotPoint(moment.aim, KEEPER_SHARE)).x);
}

// a skill's shot saved by team 1's keeper standing where he was, off his goal's middle, the ball
// coming in `side` of the goal's width from it
function standingSave(side) {
  const match = attachDuels(matchInPlay(), { watched: true });
  const keeper = Object.assign(match.players[11], { dive: null });

  Object.assign(match.ball, {
    owner: null,
    y: midY(match) + (side * match.goal.width) / 2,
    z: 0.3 * match.goal.height,
    kick: 'shot',
    lastTouch: 9,
  });
  match.lastShot = { shooter: 9, move: 'naga-shot', level: 0, tick: match.tick };
  saveCamAfterSave(match, {
    keeper,
    result: 'parried',
    stretch: 0.5,
    skillShot: isSkillShot(match),
  });

  return match.saveCam;
}

describe('a keeper who keeps the ball out reaches it', () => {
  it('the village friendly’s parry beside him', () => {
    expect(missBy(VILLAGE)).toBeLessThan(REACH);
  });

  it.each([-0.9, -0.6, -0.3, -0.15, 0, 0.15, 0.3, 0.6, 0.9])('a save at %s across', (side) => {
    for (const [result, style] of [
      ['saved', 'catch'],
      ['parried', 'catch'],
      ['parried', 'punch'],
    ]) {
      expect(missBy({ result, style, aim: { side, height: 0.4 }, dive: 0 }), result).toBeLessThan(
        REACH,
      );
    }
  });

  it('from open play, standing off his goal’s middle', () => {
    const moment = standingSave(VILLAGE.aim.side);

    expect(moment.dive).toBe(0);
    expect(missBy(moment)).toBeLessThan(REACH);
  });

  it('while a wall still stands where he is, and one beaten through the middle stands beaten', () => {
    expect(camMoment({ ...VILLAGE, result: 'saved', style: 'wall' }).dive).toBe(0);
    expect(camMoment({ result: 'goal', aim: { side: 0.1, height: 0.9 }, dive: 0 }).dive).toBe(0);
  });
});
