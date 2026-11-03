import { describe, expect, it } from 'vitest';
import { PASS_COMBO } from '../../../src/data/combos.js';
import { SAVE_CAM } from '../../../src/data/save-cam.js';

describe('when the save cam plays in open play', () => {
  it('waits for a pass combo that has a finisher, and a stretch near the end of the reach', () => {
    expect(SAVE_CAM.fromLevel).toBeGreaterThanOrEqual(PASS_COMBO.finisherFrom);
    expect(SAVE_CAM.fromLevel).toBeLessThanOrEqual(PASS_COMBO.most);
    expect(SAVE_CAM.stretchShare > 0.5 && SAVE_CAM.stretchShare < 1).toBe(true);
  });

  it('comes seldom, so the match does not stop all the time', () => {
    expect(SAVE_CAM.gapTicks).toBeGreaterThanOrEqual(600);
    expect(SAVE_CAM.mostPerHalf).toBeLessThanOrEqual(3);
  });

  it('ends itself if nothing ends it, after a couple of seconds or so', () => {
    expect(SAVE_CAM.timeout).toBeGreaterThan(120);
    expect(SAVE_CAM.timeout).toBeLessThanOrEqual(300);
  });
});
