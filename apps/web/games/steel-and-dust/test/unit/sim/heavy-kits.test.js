import { describe, expect, it } from 'vitest';
import { HEAVY_ART } from '../../../src/art/heavy-fx/index.js';
import { HEAVY_SOUNDS } from '../../../src/audio/live/heavy/index.js';
import { HEAVY_FEEL } from '../../../src/data/heavy-feel/index.js';
import { HEROES } from '../../../src/data/heroes.js';
import { HEAVY_PARTICLE_DRAWS, HEAVY_RENDERS } from '../../../src/render/fx/heavy/index.js';
import { HEAVY_KITS, HEAVY_PARTICLE_MOVERS } from '../../../src/sim/fx/heavy/index.js';

const SHARED_KINDS = ['spark', 'dust', 'chunk', 'mote', 'streak'];
const HOOKS = ['windup', 'gather', 'release', 'trail', 'impact'];
const HEX = /^#[0-9a-f]{6}$/i;
const ids = HEROES.map((hero) => hero.id);

// every Shade's heavy plugs into the same driver (sim/fx/heavy-feel.js); this is that contract
describe("every Shade's heavy kit", () => {
  it.each(ids)('%s has every hook, and a charge sound of its own that exists', (id) => {
    const kit = HEAVY_KITS[id];
    for (const hook of HOOKS) {
      expect(typeof kit[hook], hook).toBe('function');
    }
    expect(kit.sounds.charge).toBe(`heavy${id[0].toUpperCase()}${id.slice(1)}Charge`);
    for (const key of Object.values(kit.sounds).filter(Boolean)) {
      expect(Object.hasOwn(HEAVY_SOUNDS, key), key).toBe(true);
    }
  });

  it.each(ids)('%s names its own particle kinds after itself and draws each one', (id) => {
    const moved = Object.keys(HEAVY_KITS[id].particles);
    const drawn = Object.keys(HEAVY_RENDERS[id].particles);
    expect(drawn.sort()).toEqual(moved.sort());
    for (const kind of moved) {
      expect(kind.startsWith(id), kind).toBe(true);
      expect(SHARED_KINDS).not.toContain(kind);
    }
  });

  it.each(ids)('%s draws layers that are functions where it has them', (id) => {
    for (const layer of ['under', 'over']) {
      const draw = HEAVY_RENDERS[id][layer];
      expect(draw === null || typeof draw === 'function', layer).toBe(true);
    }
  });

  it.each(ids)('%s has its colors and a feel within bounds', (id) => {
    const art = HEAVY_ART[id];
    for (const key of ['glowDim', 'glow', 'hot', 'trail']) {
      expect(art[key], key).toMatch(HEX);
    }
    expect(art.motes.length).toBeGreaterThan(0);
    art.motes.forEach((color) => expect(color).toMatch(HEX));
    const feel = HEAVY_FEEL[id];
    expect(feel.lean).toBeGreaterThanOrEqual(0);
    expect(feel.lean).toBeLessThanOrEqual(6);
    expect(feel.leanTicks).toBeGreaterThanOrEqual(1);
    expect(feel.leanTicks).toBeLessThanOrEqual(12);
    expect(feel.lunge).toBeGreaterThanOrEqual(0);
    expect(feel.lunge).toBeLessThanOrEqual(3);
    expect(feel.afterimageEvery).toBeGreaterThanOrEqual(1);
    expect(feel.afterimageLife).toBeLessThanOrEqual(20);
    for (const tuned of Object.values(feel.moves)) {
      expect(tuned.lunge ?? 0).toBeLessThanOrEqual(3);
    }
  });

  it('gathers every kind into one set of movers and one of drawers', () => {
    expect(Object.keys(HEAVY_PARTICLE_DRAWS).sort()).toEqual(
      Object.keys(HEAVY_PARTICLE_MOVERS).sort(),
    );
  });
});
