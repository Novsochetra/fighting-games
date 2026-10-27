import { describe, expect, it } from 'vitest';
import { CONVEYOR, beltLength } from '../../../src/data/conveyors.js';
import { beltPieces, plateSlots, plateSpan } from '../../../src/render/scene/conveyor-pieces.js';

const BELT = { from: 100, to: 100 + beltLength(3), y: 184, direction: 1, segments: 3 };
// the ticks the belt takes to run one segment on
const ONE_SEGMENT = CONVEYOR.segment / CONVEYOR.speed;

describe('a conveyor belt as drawn', () => {
  it('lays the far end by the mouth, its segments one after another, then the drive end', () => {
    const pieces = beltPieces(BELT);
    const backs = pieces.map((piece) => piece.back);

    expect(pieces.map((piece) => piece.frame)).toEqual([5, 0, 1, 2, 4]);
    for (let i = 2; i < backs.length; i++) {
      expect(backs[i] - backs[i - 1]).toBe(CONVEYOR.segment);
    }
    expect(backs[0]).toBeLessThan(backs[1] - CONVEYOR.segment / 2);
  });

  it('carries along its whole drawn length, from the drive wheel to the far end', () => {
    const drive = beltPieces(BELT).at(-1);
    const length = BELT.to - BELT.from;

    expect(length).toBeGreaterThan(drive.back);
    expect(length).toBeLessThan(drive.back + CONVEYOR.segment / 2);
  });

  it('runs its plates on toward the mouth at the pace it carries', () => {
    const [first] = plateSlots(BELT, 0);
    const [moved] = plateSlots(BELT, 10);

    expect(first.back - moved.back).toBeCloseTo(10 * CONVEYOR.speed);
  });

  it('runs on seamlessly: one segment on, each place shows the plates the one above it showed', () => {
    const before = plateSlots(BELT, 0);
    const after = plateSlots(BELT, ONE_SEGMENT);

    expect(after.map((slot) => slot.back)).toEqual(before.map((slot) => slot.back));
    expect(after.slice(0, -1).map((slot) => slot.frame)).toEqual(
      before.slice(1).map((slot) => slot.frame),
    );
  });

  it('shows the moving plates over every segment and no further', () => {
    const { near, far } = plateSpan(BELT);
    const segments = beltPieces(BELT).slice(1, -1);

    expect(near).toBe(segments[0].back - CONVEYOR.segment / 2);
    expect(far).toBe(segments.at(-1).back + CONVEYOR.segment / 2);
  });
});
