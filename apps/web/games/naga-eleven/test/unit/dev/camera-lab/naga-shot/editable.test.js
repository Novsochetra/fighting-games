import { afterEach, describe, expect, it } from 'vitest';

import { NAGA_SHOTS } from '../../../../../dev/camera-lab/src/naga-shot/camera/shots.js';
import { NAGA_TIMINGS, planFor } from '../../../../../dev/camera-lab/src/naga-shot/sequence.js';
import { applyValue, EDITABLE, resetValue } from '../../../../../dev/camera-lab/src/shot-lists.js';

afterEach(() => Object.keys(EDITABLE).forEach(resetValue));

describe("the Naga Shot in the lab's editor", () => {
  it('offers its camera stage by stage, its timings and its shakes', () => {
    const keys = Object.keys(EDITABLE).filter((key) => key.startsWith('naga.'));

    expect(keys).toContain('naga.timings');
    expect(keys).toContain('naga.shakes');
    expect(keys).toContain('naga.keeper');
  });

  it('takes a shot four steps in, as its camera has, and no further', () => {
    expect(applyValue('naga.impact', [{ from: 0, on: 'ball', step: 4 }])).toBeNull();
    expect(NAGA_SHOTS.impact).toEqual([{ from: 0, on: 'ball', step: 4 }]);
    expect(applyValue('naga.impact', [{ from: 0, on: 'ball', step: 5 }])).toEqual(
      expect.any(String),
    );
  });

  it('plays a timing changed at once', () => {
    const timings = JSON.parse(JSON.stringify(NAGA_TIMINGS));
    const before = planFor({ camera: 'full' }).total;

    timings.stages.charge += 30;

    expect(applyValue('naga.timings', timings)).toBeNull();
    expect(planFor({ camera: 'full' }).total).toBe(before + 30);
    expect(applyValue('naga.timings', { ...timings, hitStop: -2 })).toEqual(expect.any(String));
  });
});
