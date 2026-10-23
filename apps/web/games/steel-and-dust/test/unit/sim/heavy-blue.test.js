import { afterEach, describe, expect, it } from 'vitest';
import { BLUE_HEAVY_ART } from '../../../src/art/heavy-fx/blue.js';
import { COLORS } from '../../../src/art/colors.js';
import { GROUND_Y } from '../../../src/config.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { isHeavyMove } from '../../../src/data/moves/heavy-moves.js';
import { BLUE_HEAVY_RENDER } from '../../../src/render/fx/heavy/blue.js';
import { createPainter } from '../../../src/render/painter.js';
import { BLUE_HEAVY_KIT } from '../../../src/sim/fx/heavy/blue.js';
import { strikeLineOf } from '../../../src/sim/fx/heavy/blue-strike.js';
import { createRecordingContext } from '../../support/recording-canvas.js';

const kit = BLUE_HEAVY_KIT;
const originalRandom = Math.random;
const K1 = { id: 'K1', startup: 9, active: 4, hitbox: [4, -25, 28, 10] };
const K2 = { id: 'K2', startup: 7, active: 15, hitbox: [-8, -34, 40, 26], multiHit: 3 };
const K3 = { id: 'K3', startup: 4, active: 10, hitbox: [2, -36, 30, 22] };
const FROST = new Set([...Object.values(BLUE_HEAVY_ART).flat(), COLORS.white]);

function frostGame() {
  const player = { x: 120, y: GROUND_Y, facing: 1, airborne: false, trail: [], hitstop: 0 };
  return { player, particles: [], fxSeed: 7, terrain: { platforms: [] } };
}

// the particles' own tick, as update-effects.js runs it
function stepParticles(game) {
  for (const particle of game.particles) {
    particle.life--;
    kit.particles[particle.kind](particle, game.terrain);
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
}

function windingUp(game, move, time) {
  const fighter = game.player;
  if (time === 0) {
    kit.windup(game, fighter, move);
  }
  if (time < move.startup) {
    kit.gather(game, fighter, move, time);
  }
  if (time === move.startup) {
    kit.release(game, fighter, move);
  }
}

// a blow lands as it strikes, and again on each beat of a move of many blows
function striking(game, move, time) {
  const fighter = game.player;
  if (time < move.startup || time >= move.startup + move.active) {
    return;
  }
  kit.trail(game, fighter, move, time);
  if ((time - move.startup) % (move.multiHit ?? 99) === 0) {
    kit.impact(game, { attacker: fighter, move, x: fighter.x + 26, y: fighter.y - 20 });
  }
}

// one heavy through the kit as heavy-feel.js drives it
function playMove(game, move, onTick = () => {}) {
  game.player.move = move;
  for (let time = 0; time < move.startup + move.active + 4; time++) {
    windingUp(game, move, time);
    striking(game, move, time);
    stepParticles(game);
    onTick(time);
  }
}

function colorsDrawn(log) {
  return log.filter((entry) => entry.startsWith('fillStyle=')).map((entry) => entry.slice(10));
}

describe("the Blue Shade's heavy", () => {
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('breaks every crystal it grows over the wind-up the moment it strikes', () => {
    const game = frostGame();
    const crystals = [];
    playMove(game, K1, (time) => {
      crystals[time] = game.particles.filter((particle) => particle.kind === 'blueCrystal').length;
    });
    expect(Math.max(...crystals.slice(0, K1.startup))).toBeGreaterThan(0);
    expect(crystals[K1.startup]).toBe(0);
  });

  it('opens its cold flash where its cut starts, clear of the Shade and below its face', () => {
    for (const weapon of Object.values(WEAPONS)) {
      for (const move of Object.values(weapon.moves).filter(isHeavyMove)) {
        for (const facing of [1, -1]) {
          const fighter = { x: 200, y: GROUND_Y, facing };
          const { from, to } = strikeLineOf(fighter, move);
          expect((from.x - fighter.x) * facing, move.name).toBeGreaterThanOrEqual(8);
          expect(from.y, move.name).toBeGreaterThanOrEqual(fighter.y - 24);
          expect((to.x - from.x) * facing, move.name).toBeGreaterThan(0);
        }
      }
    }
    const game = frostGame();
    kit.release(game, game.player, K1);
    const flash = game.particles.find((particle) => particle.kind === 'blueFlash');
    expect(flash).toMatchObject(strikeLineOf(game.player, K1).from);
  });

  it('keeps a whole K K K chain within its share of the particles', () => {
    const game = frostGame();
    let most = 0;
    for (const move of [K1, K2, K3]) {
      playMove(game, move, () => {
        most = Math.max(most, game.particles.length);
      });
    }
    expect(most).toBeGreaterThan(10);
    expect(most).toBeLessThanOrEqual(60);
  });

  it('throws ice that falls and lies on the ground', () => {
    const game = frostGame();
    kit.impact(game, { attacker: game.player, move: K1, x: 140, y: GROUND_Y - 20 });
    const shard = game.particles.find((particle) => particle.kind === 'blueShard');
    shard.life = 200;
    for (let i = 0; i < 80; i++) {
      stepParticles(game);
    }
    expect(shard).toMatchObject({ landed: true, y: GROUND_Y - 1 });
  });

  it('draws its frost on the pixel grid in its own colors, without Math.random', () => {
    const game = frostGame();
    const { context, log } = createRecordingContext(null);
    const painter = createPainter(context);
    Math.random = () => {
      throw new Error('drawing a heavy used Math.random');
    };
    playMove(game, K1, (time) => {
      const layer = { fighter: game.player, move: K1, time, art: BLUE_HEAVY_ART, tickCount: time };
      BLUE_HEAVY_RENDER.under(painter, layer);
      for (const particle of game.particles) {
        BLUE_HEAVY_RENDER.particles[particle.kind](painter, particle);
      }
      BLUE_HEAVY_RENDER.over(painter, layer);
    });
    const colors = colorsDrawn(log);
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.filter((color) => !FROST.has(color))).toEqual([]);
    const rects = log.filter((entry) => entry.startsWith('fillRect('));
    expect(rects.length).toBeGreaterThan(100);
    const onGrid = (entry) =>
      entry
        .slice(9, -1)
        .split(',')
        .every((value) => Number.isInteger(Number(value)));
    expect(rects.filter((entry) => !onGrid(entry))).toEqual([]);
  });
});
