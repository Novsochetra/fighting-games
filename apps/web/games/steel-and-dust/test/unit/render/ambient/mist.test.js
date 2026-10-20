import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../../src/config.js';
import { SAMPLE_EFFECTS, rectsOf, recordEffect } from './ambient-recorder.js';

const mist = SAMPLE_EFFECTS.mist;

describe('ambient mist', () => {
  it('lays three translucent bands across the whole view', () => {
    const rects = rectsOf(mist, { tick: 0 });
    const bodies = rects.filter((rect) => rect.width === VIEW_WIDTH);
    expect(bodies.map((body) => body.x)).toEqual([0, 0, 0]);
    expect(bodies.map((body) => body.alpha)).toEqual([0.1, 0.14, 0.18]);
    for (const body of bodies) {
      expect(body.y + body.height).toBe(mist.y + mist.height);
    }
  });

  it('has a stepped, wavy top edge', () => {
    const edges = rectsOf(mist, { tick: 0 }).filter((rect) => rect.width < VIEW_WIDTH);
    expect(new Set(edges.map((edge) => edge.y)).size).toBeGreaterThan(3);
    expect(edges.every((edge) => edge.width === 8)).toBe(true);
  });

  it('drifts sideways over time and with the camera', () => {
    const still = recordEffect(mist, { tick: 0 }).log;
    expect(recordEffect(mist, { tick: 240 }).log).not.toEqual(still);
    expect(recordEffect(mist, { tick: 0, cameraX: 50 }).log).not.toEqual(still);
    expect(recordEffect({ ...mist, drift: 0 }, { cameraX: 50 }).log).toEqual(
      recordEffect({ ...mist, drift: 0 }).log,
    );
  });
});
