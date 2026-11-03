import { describe, expect, it } from 'vitest';

import {
  createSaveCam,
  isSaveCamDone,
  SAVE_CAM_TICKS,
  updateSaveCam,
} from '../../../../src/render/save-cam/index.js';
import { fakeMatch } from '../../../support/duel-fixtures.js';

const moment = { shooter: 4, keeper: 5, move: 'naga-shot', result: 'saved' };

describe('a save cam', () => {
  it('runs its length in open play, and then holds', () => {
    const cam = createSaveCam(fakeMatch(), moment);

    for (let i = 0; i < SAVE_CAM_TICKS.open - 1; i += 1) {
      updateSaveCam(cam, {});
    }

    expect(isSaveCamDone(cam)).toBe(false);

    updateSaveCam(cam, {});
    updateSaveCam(cam, {});

    expect(isSaveCamDone(cam)).toBe(true);
    expect(cam.ticks).toBe(SAVE_CAM_TICKS.open);
  });

  it('skips to its end on a press or a tap, only once it has run a moment', () => {
    const cam = createSaveCam(fakeMatch(), moment, { length: SAVE_CAM_TICKS.duel });

    updateSaveCam(cam, { pressed: { pass: true } });

    expect(isSaveCamDone(cam)).toBe(false);

    while (cam.ticks < SAVE_CAM_TICKS.skipAfter) {
      updateSaveCam(cam, {});
    }

    updateSaveCam(cam, { tap: { x: 10, y: 10 } });

    expect(isSaveCamDone(cam)).toBe(true);
    expect(cam.ticks).toBe(SAVE_CAM_TICKS.duel);
  });

  it('fills in what the sim left out, the same way for the same match tick', () => {
    const match = fakeMatch();

    expect(createSaveCam(match, moment).moment).toEqual(createSaveCam(match, moment).moment);
    expect(createSaveCam(match, moment).moment.aim).toBeDefined();
  });
});
