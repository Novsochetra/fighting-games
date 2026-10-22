import { describe, expect, it } from 'vitest';
import { POUNDING_LION } from '../../../src/data/ultimates/pounding-lion.js';
import { LION_RISE_TICKS } from '../../../src/sim/summons/lions.js';
import { heapAt, prideFlight, prideSchedule } from '../../../src/sim/ultimates/lion-pride.js';
import { WAKE_AT } from '../../../src/sim/ultimates/rush-timing.js';

const { pride, pounceAt, cascade, hopTicks, ripple } = POUNDING_LION;
const flat = () => 180;
const lay = { heap: 400, ground: flat, scale: 0.5, run: 40 };

describe("the lion pride's timing", () => {
  const schedule = prideSchedule();
  const leapsAt = schedule.map(({ delay, appear }) => WAKE_AT + delay + appear);
  const landsAt = schedule.map(({ delay, appear, run }) => WAKE_AT + delay + appear + run);

  it('wakes the echoes one after another, in the order he struck', () => {
    schedule.forEach(({ delay }, rank) => expect(delay).toBe(rank * ripple));
  });

  it('lets every lion rise all the way before it bounds off', () => {
    schedule.forEach(({ appear }) => expect(appear).toBeGreaterThanOrEqual(LION_RISE_TICKS));
  });

  it('never sends two lions off on the same tick', () => {
    expect(new Set(leapsAt).size).toBe(pride.length);
  });

  it('gives every lion time for its hop and a full leap', () => {
    schedule.forEach(({ run }) => expect(run).toBeGreaterThanOrEqual(hopTicks + 18));
  });

  it('lands them one after another, the biggest last as the hero strikes', () => {
    landsAt.slice(1).forEach((tick, i) => expect(tick - landsAt[i]).toBe(cascade));
    expect(landsAt.at(-1)).toBe(pounceAt);
    const scales = schedule.map(({ scale }) => scale);
    expect(new Set(scales).size).toBeGreaterThan(pride.length / 2);
    expect(scales.at(-1)).toBe(Math.max(...scales));
  });
});

describe("a pride lion's run", () => {
  it('rises where its echo stood, hops toward the heap, then bounds onto it', () => {
    const flight = prideFlight(100, 0, lay);
    expect(flight[0]).toEqual([0, 100, 180, 0]);
    expect(flight[1][0]).toBe(hopTicks);
    expect(flight[1][1]).toBeGreaterThan(100);
    expect(flight[1][1]).toBeLessThan(flight[2][1]);
    expect(Math.abs(flight.at(-1)[1] - lay.heap)).toBeLessThan(40);
    expect(flight.at(-1)[0]).toBe(lay.run);
  });

  it('comes at the heap from either side', () => {
    const fromRight = prideFlight(700, 3, lay);
    expect(fromRight[1][1]).toBeLessThan(700);
    expect(fromRight.at(-1)[1]).toBeLessThan(fromRight[1][1]);
  });

  it('lands in a loose heap, not all on one pixel', () => {
    const landings = pride.map((_, rank) => prideFlight(100, rank, lay).at(-1)[1]);
    expect(new Set(landings).size).toBe(pride.length);
  });

  it('leaps higher the bigger the lion', () => {
    const small = prideFlight(100, 0, lay);
    const big = prideFlight(100, 0, { ...lay, scale: 0.7 });
    expect(big[1][3]).toBeGreaterThan(small[1][3]);
    expect(big.at(-1)[3]).toBeGreaterThan(small.at(-1)[3]);
  });

  it('heaps up ahead of the hero, the way he faces', () => {
    expect(heapAt(300, 1)).toBeGreaterThan(300);
    expect(heapAt(300, -1)).toBeLessThan(300);
  });
});
