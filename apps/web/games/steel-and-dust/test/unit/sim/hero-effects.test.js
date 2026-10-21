import { describe, expect, it } from 'vitest';
import { FX_COLORS } from '../../../src/art/fx-colors.js';
import { HERO_THEMES } from '../../../src/art/hero-themes.js';
import { WEAPON_COLORS } from '../../../src/art/weapon-colors.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { sparkColorOf, trailColorOf } from '../../../src/sim/fighters/hero-colors.js';
import { shedHeroAura } from '../../../src/sim/fx/hero-aura.js';
import { burstMaterial } from '../../../src/sim/fx/material-bursts.js';
import { scatterFeathers } from '../../../src/sim/fx/phoenix-feathers.js';
import { createPlayingGame } from '../../support/test-game.js';

function playingAs(hero) {
  return createPlayingGame({ settings: { hero } });
}

describe("each Shade's glow", () => {
  it('colors the sword by the Shade and leaves the other weapons alone', () => {
    const game = playingAs('firefly');
    expect(trailColorOf(game, 'sword')).toBe(HERO_THEMES.firefly.blade);
    expect(sparkColorOf(game, 'sword')).toBe(HERO_THEMES.firefly.spark);
    expect(trailColorOf(game, 'axe')).toBe(WEAPON_COLORS.axe.trail);
  });

  it("lets the Ember Shade's spear burn with its sword's fire, and only its own", () => {
    const ember = playingAs('ember');
    expect(trailColorOf(ember, 'spear')).toBe(HERO_THEMES.ember.blade);
    expect(sparkColorOf(ember, 'spear')).toBe(HERO_THEMES.ember.spark);
    expect(trailColorOf(ember, 'fists')).toBe(WEAPON_COLORS.fists.trail);
    expect(trailColorOf(playingAs('moss'), 'spear')).toBe(WEAPON_COLORS.spear.trail);
  });

  it('sheds motes of its own color, the Firefly Shade far more often than the Moss Shade', () => {
    const count = (hero) => {
      const game = playingAs(hero);
      for (let tick = 0; tick < 120; tick++) {
        game.tickCount = tick;
        shedHeroAura(game);
      }
      return game.particles.filter((particle) => particle.color === HERO_THEMES[hero].aura.color);
    };
    expect(count('firefly').length).toBe(24);
    expect(count('moss').length).toBe(10);
  });

  it('sheds nothing on the title screen or while knocked out', () => {
    const game = playingAs('blue');
    game.mode = 'title';
    shedHeroAura(game);
    game.mode = 'play';
    game.player.state = 'ko';
    shedHeroAura(game);
    expect(game.particles).toHaveLength(0);
  });
});

describe('material bursts', () => {
  it('throws stone chips off the colossus and nothing off a plain raider', () => {
    const game = playingAs('moss');
    burstMaterial(game, { target: { def: { material: 'stone' } }, x: 10, y: 20 }, 1);
    expect(game.particles.map((particle) => particle.kind)).toEqual(Array(5).fill('chunk'));
    expect(game.particles.every((particle) => particle.vx > 0)).toBe(true);
    burstMaterial(game, { target: { def: {} }, x: 10, y: 20 }, 1);
    expect(game.particles).toHaveLength(5);
  });

  it('chips grey-green temple stone and a fleck of gold off the Bayon Guardian', () => {
    const game = playingAs('moss');
    burstMaterial(game, { target: { def: ENEMY_TYPES.guardian }, x: 10, y: 20 }, -1);
    expect(game.particles.map((particle) => particle.color)).toEqual([
      FX_COLORS.sandstone,
      FX_COLORS.sandstoneDark,
      FX_COLORS.sandstoneGold,
      FX_COLORS.sandstone,
      FX_COLORS.sandstoneDark,
    ]);
    expect(game.particles.every((particle) => particle.vx < 0)).toBe(true);
  });

  it('scatters phoenix feathers off a feathered strike only, flying the way it was struck', () => {
    const game = playingAs('ember');
    scatterFeathers(game, { move: { feathers: true }, x: 10, y: 20 }, -1);
    scatterFeathers(game, { move: {}, x: 30, y: 20 }, 1);
    expect(game.summons).toEqual([
      expect.objectContaining({ kind: 'burst', sprite: 'feathers', x: 10, y: 20, direction: -1 }),
    ]);
  });
});
