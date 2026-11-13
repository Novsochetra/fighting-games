import { describe, expect, it } from 'vitest';

import {
  CHASE_SHOTS,
  CLASH_SHOTS,
  CUTIN_SHOTS,
  FINALE_SHOTS,
  saveCamShots,
} from '../../../src/data/shots.js';
import { MOST_STEPS } from '../../../src/render/duel/lens/lens-pen.js';

// what each stage can point its camera at
const TARGETS = {
  cutin: ['middle', 'band', 'face', 'ahead', 'boot'],
  clash: ['middle', 'meeting', 'impact', 'ball'],
  finale: ['middle', 'keeper'],
  chase: ['middle', 'ball'],
  saveCam: ['middle', 'goal', 'aim', 'ball', 'gloves', 'keeper'],
};

const OUTCOMES = ['catch', 'parry', 'punch', 'wall', 'goal', 'wide', 'post'];

const LISTS = [
  ['cutin', CUTIN_SHOTS.portrait],
  ['cutin', CUTIN_SHOTS.strike],
  ['clash', CLASH_SHOTS],
  ['finale', FINALE_SHOTS],
  ['chase', CHASE_SHOTS],
  ...OUTCOMES.map((outcome) => ['saveCam', saveCamShots(outcome)]),
];

describe('the cinematic camera shots', () => {
  it.each(LISTS)('%s: start at tick 0, in order, at a step the lens has', (_, shots) => {
    expect(shots[0].from).toBe(0);
    expect(shots[0].glide).toBeUndefined();

    shots.forEach((shot, i) => {
      expect(shot.step).toBeGreaterThanOrEqual(0);
      expect(shot.step).toBeLessThanOrEqual(MOST_STEPS);
      expect(Number.isInteger(shot.step)).toBe(true);

      if (i > 0) {
        expect(shot.from).toBeGreaterThan(shots[i - 1].from);
      }
    });
  });

  it.each(LISTS)('%s: looks only at what its stage names', (stage, shots) => {
    for (const shot of shots) {
      expect(TARGETS[stage]).toContain(shot.on);
    }
  });

  it("closes in at the save cam's contact for every save, and pulls back for a goal", () => {
    for (const outcome of ['catch', 'parry', 'punch', 'wall']) {
      const contact = saveCamShots(outcome).find((shot) => shot.from === 40);

      expect(contact.step).toBeGreaterThanOrEqual(2);
    }

    expect(saveCamShots('goal').at(-1).step).toBe(0);
  });
});
