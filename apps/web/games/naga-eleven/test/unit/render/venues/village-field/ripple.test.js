import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../../../src/data/formats.js';
import { puddleOf, reachOf } from '../../../../../src/render/venues/village-field/puddle.js';
import {
  DROP_SPOTS,
  DROPS,
  dropAt,
  ringsOf,
  toneOf,
} from '../../../../../src/render/venues/village-field/ripple.js';

const puddles = ['7', '11'].map((format) => puddleOf({ pitch: FORMATS[format].pitch }));
const [puddle] = puddles;

const ticksOf = (from, count) => Array.from({ length: count }, (_, i) => from + i);

describe('a drop in the village puddle', () => {
  it('falls now and then: about once in every few seconds, with still water between', () => {
    const ticks = ticksOf(0, DROPS.every * 20);
    const falls = ticks.filter((tick) => dropAt(puddle, tick)?.age === 0);
    const still = ticks.filter((tick) => dropAt(puddle, tick) === null);

    expect(falls.length).toBe(20);
    expect(still.length).toBeGreaterThan(ticks.length * 0.3);
  });

  it('is the same drop for the same tick, so a frame drawn twice matches', () => {
    for (const tick of ticksOf(500, 400)) {
      expect(dropAt(puddle, tick)).toEqual(dropAt(puddle, tick));
    }
  });

  it('lands in more than one place', () => {
    const places = new Set(
      ticksOf(0, DROPS.every * 40)
        .map((tick) => dropAt(puddle, tick))
        .filter((drop) => drop?.age === 0)
        .map((drop) => `${drop.x},${drop.y}`),
    );

    expect(places.size).toBeGreaterThan(2);
  });

  it('sends out rings one after another that grow slowly and fade as they go', () => {
    const young = ringsOf({ age: DROPS.gap * 2 + 1 });
    const later = ringsOf({ age: DROPS.gap * 2 + 40 });

    expect(young.map((ring) => ring.radius)).toEqual(
      [...young.map((ring) => ring.radius)].sort((first, second) => second - first),
    );
    expect(young).toHaveLength(DROPS.rings);
    expect(later[0].radius).toBeGreaterThan(young[0].radius);
    expect(later[0].radius - young[0].radius).toBeLessThan(4);
    expect(later[0].strength).toBeLessThan(young[0].strength);
    expect(ringsOf({ age: 10000 })).toEqual([]);
  });

  it('fades a ring a step of the ramp at a time, breaking up only at its end', () => {
    expect(toneOf(0.95)).toMatchObject({ lit: 5, share: 1 });
    expect(toneOf(0.5)).toMatchObject({ lit: 4, share: 1 });
    expect(toneOf(0.1).share).toBeLessThan(1);
  });

  it('keeps every ring of every place it lands on the water, 7 and 11 a side', () => {
    for (const each of puddles) {
      for (const [dx, dy] of DROP_SPOTS) {
        for (let turn = 0; turn < 64; turn += 1) {
          const angle = (turn / 64) * Math.PI * 2;
          const x = each.drop.x + dx + Math.cos(angle) * 2.3 * (DROPS.most + 0.5);
          const y = each.drop.y + dy + Math.sin(angle) * (DROPS.most + 0.5);

          expect(reachOf(each, x, y), `${dx},${dy} at ${turn}`).toBeLessThan(0.97);
        }
      }
    }
  });
});
