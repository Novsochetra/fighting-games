import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { MOAT } from '../../../src/data/moat.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';

// a hero's running jump clears this much from the edge, and so does a raider's leap
const JUMP_ACROSS = 48;
// a raider walks in from just past the screen's edge to a little inside it (spawn-enemy.js)
const ENTRY_OUTSIDE = 18;
const ENTRY_INSIDE = 10;
const BANK = MOAT.bankIn + 8;

const moatsOf = (mission) =>
  mission.terrain.water.map((span) => ({
    span,
    zone: mission.zones.find((zone) => span.from >= zone.left && span.to <= zone.right),
    label: `${mission.name} moat at ${span.from}`,
  }));
const level = (mission, from, to) =>
  new Set(Array.from({ length: to - from }, (_, i) => groundAt(mission.terrain, from + i))).size;

describe('the moats of every mission', () => {
  it('cut a breach narrow enough to jump, between banks at one height above the water', () => {
    for (const mission of MISSIONS) {
      for (const { span, label } of moatsOf(mission)) {
        const near = groundAt(mission.terrain, span.from - 1);
        expect(span.to - span.from, label).toBeLessThanOrEqual(JUMP_ACROSS);
        expect(level(mission, span.from - BANK, span.from), label).toBe(1);
        expect(level(mission, span.to, span.to + BANK), label).toBe(1);
        expect(groundAt(mission.terrain, span.to), label).toBe(near);
        expect(span.level, label).toBeGreaterThan(near);
      }
    }
  });

  it('lie inside a fighting zone, clear of the screen its last wave locks and of its crates', () => {
    for (const mission of MISSIONS) {
      for (const { span, zone, label } of moatsOf(mission)) {
        expect(zone, label).toBeDefined();
        expect(zone.boss, label).toBeNull();
        expect(span.to, label).toBeLessThanOrEqual(zone.right - VIEW_WIDTH - ENTRY_OUTSIDE);
        expect(span.from, label).toBeGreaterThan(zone.left + ENTRY_INSIDE);
        const crates = [...mission.crates, ...mission.kegs];
        const wet = crates.filter(({ x }) => x > span.from - BANK && x < span.to + BANK);
        expect(wet, label).toEqual([]);
      }
    }
  });

  it('are on the Angkor causeway', () => {
    const moats = MISSIONS.flatMap(moatsOf).map(({ label }) => label.replace(/ at .*/, ''));
    expect(moats).toEqual(['Angkor Wat moat']);
  });
});
