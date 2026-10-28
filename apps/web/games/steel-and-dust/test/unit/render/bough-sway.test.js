import { describe, expect, it } from 'vitest';
import { DROP } from '../../../src/data/ambush.js';
import { boughSway } from '../../../src/render/scene/bough-sway.js';

const ticks = (from, to) => Array.from({ length: to - from }, (_, i) => from + i);
const sagAt = (time) => boughSway(time).sag;
const swayAt = (time) => boughSway(time).sway;
const turns = (values) =>
  values.slice(1).filter((value, i) => Math.sign(value) !== Math.sign(values[i])).length;

describe('the bough a raider waits on', () => {
  it('is still before the raider comes, and as it climbs on', () => {
    expect(boughSway(-5)).toEqual({ sway: 0, sag: 0 });
    expect(boughSway(0).sag).toBeCloseTo(0);
    expect(boughSway(0).sway).toBeCloseTo(0);
  });

  it('sinks under its weight past where it comes to rest, and settles back', () => {
    const deepest = Math.max(...ticks(1, 20).map(sagAt));

    expect(deepest).toBeGreaterThan(2.5);
    expect(sagAt(24)).toBeLessThan(deepest - 0.3);
    expect(sagAt(24)).toBeGreaterThan(1.5);
  });

  it('tips aside as the raider lands, then leans once as it shifts its weight', () => {
    expect(Math.max(...ticks(1, 14).map(swayAt))).toBeGreaterThan(0.7);
    expect(Math.max(...ticks(24, 40).map(swayAt))).toBeGreaterThan(0.7);
    expect(Math.abs(swayAt(46))).toBeLessThan(0.3);
  });

  it('dips further as the raider crouches, trembling harder and harder, as it gets ready', () => {
    const last = ticks(DROP.warn - 16, DROP.warn).map(swayAt);

    expect(sagAt(DROP.warn)).toBeGreaterThan(sagAt(40) + 0.8);
    expect(turns(last)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...last.slice(-8).map(Math.abs))).toBeGreaterThan(0.9);
  });

  it('springs up past where it rests as the raider lets go, whips aside and comes to rest', () => {
    const after = ticks(DROP.warn, DROP.warn + 20);

    expect(Math.min(...after.map(sagAt))).toBeLessThan(-0.8);
    expect(Math.max(...after.map(swayAt))).toBeGreaterThan(0.75);
    expect(Math.abs(sagAt(DROP.warn + 26))).toBeLessThan(0.3);
    expect(Math.abs(swayAt(DROP.warn + 26))).toBeLessThan(0.3);
  });

  it('eases all the way: never moves more than two thirds of a pixel in a tick', () => {
    for (const time of ticks(1, DROP.warn + 40)) {
      const before = boughSway(time - 1);
      const now = boughSway(time);

      expect(Math.abs(now.sag - before.sag), `sag at ${time}`).toBeLessThan(0.67);
      expect(Math.abs(now.sway - before.sway), `sway at ${time}`).toBeLessThan(0.67);
    }
  });
});
