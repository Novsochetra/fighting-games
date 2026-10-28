import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import {
  GIVE_STEPS,
  heldOffset,
  playMix,
  stillMix,
  swayLines,
} from '../../../src/render/scene/held-sway.js';

const GIVE = { sway: 1, sag: 1 };
const raider = (time) => ({ time, give: GIVE });
const END = DROP.warn + 40;

// what one part of the trees is moved by at every tick of a drop
function playedThrough(steps, sources) {
  return Array.from({ length: END }, (_, tick) => {
    const lines = swayLines(sources.map((source) => raider(source.time + tick)));

    return heldOffset(lines, steps);
  });
}

const fullGive = () => playedThrough([GIVE_STEPS], [raider(0)]);
const flat = (offsets) => offsets.flatMap(({ dx, dy }) => [dx, dy]);

function moves(offsets) {
  return offsets.slice(1).map((now, i) => {
    const before = offsets[i];

    return Math.max(Math.abs(now.dx - before.dx), Math.abs(now.dy - before.dy));
  });
}

// moved somewhere and straight back again within two ticks
function flicks(offsets) {
  const key = ({ dx, dy }) => `${dx},${dy}`;

  return offsets.slice(1, -2).filter((now, i) => {
    const before = key(offsets[i]);

    return key(now) !== before && [offsets[i + 2], offsets[i + 3]].some((on) => key(on) === before);
  }).length;
}

describe('the trees over a raider, moved by whole pixels', () => {
  it('move all of their give by whole pixels, then come to rest', () => {
    const offsets = fullGive();

    expect(flat(offsets).every(Number.isInteger)).toBe(true);
    expect(Math.max(...offsets.map(({ dy }) => dy))).toBe(3);
    expect(Math.min(...offsets.map(({ dy }) => dy))).toBe(-1);
    expect(offsets.at(-1)).toEqual({ dx: 0, dy: 0 });
  });

  it('never move a part more than a pixel a tick, nor flick it there and back, however much it gives', () => {
    for (let step = 0; step <= GIVE_STEPS; step++) {
      const offsets = playedThrough([step], [raider(0)]);

      expect(Math.max(...moves(offsets)), `give ${step}`).toBeLessThanOrEqual(1);
      expect(flicks(offsets), `give ${step}`).toBe(0);
    }
  });

  it('leave a part that gives nothing still', () => {
    expect(flat(playedThrough([0], [raider(0)])).every((offset) => offset === 0)).toBe(true);
  });

  it('move a part two raiders shake by both, but never more than a pixel a tick', () => {
    for (const apart of [0, 3, 28]) {
      const offsets = playedThrough([10, 12], [raider(0), raider(-apart)]);

      expect(Math.max(...moves(offsets)), `${apart} apart`).toBeLessThanOrEqual(1);
      expect(flicks(offsets), `${apart} apart`).toBe(0);
    }
  });

  it('come to the same pixels played on a few ticks at a time as played from the start', () => {
    const lines = swayLines([raider(80), raider(52)]);
    const mix = stillMix([GIVE_STEPS, 6]);

    [0, 20, 21, 50, 81].forEach((from, i, all) => {
      playMix(
        mix,
        lines.map((line) => line.slice(0, all[i + 1] ?? line.length)),
        from,
      );
    });

    expect({ dx: mix.sway.offset, dy: mix.sag.offset }).toEqual(heldOffset(lines, [GIVE_STEPS, 6]));
  });
});
