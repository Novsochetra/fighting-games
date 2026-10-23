import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOKATOR_HEAVY_ART as ART } from '../../../src/art/heavy-fx/bokator.js';
import { BOKATOR_HEAVY_FEEL } from '../../../src/data/heavy-feel/bokator.js';
import { fxLength } from '../../../src/data/fx-sprites.js';
import { activeEnd, moveLength } from '../../../src/data/moves/define-move.js';
import { heroMoves } from '../../../src/data/styles/index.js';
import { BOKATOR_HEAVY_RENDER } from '../../../src/render/fx/heavy/bokator.js';
import { BOKATOR_HEAVY_KIT as KIT } from '../../../src/sim/fx/heavy/bokator.js';
import { FLAME_HOLD, flameTick } from '../../../src/sim/fx/heavy/bokator-bursts.js';
import { breathIn, shedLeaf } from '../../../src/sim/fx/heavy/bokator-particles.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { buildTerrain } from '../../support/terrain-game.js';

const terrain = buildTerrain();
const FLOOR = groundAt(terrain, 100);
const FISTS = heroMoves('bokator', 'fists');
const originalRandom = Math.random;

function hero(overrides = {}) {
  return { x: 100, y: FLOOR, facing: 1, airborne: false, trail: [], ...overrides };
}

const freshGame = (fxSeed) => ({ particles: [], effects: [], summons: [], fxSeed });
const bursts = (game, sprite) =>
  game.summons.filter((summon) => summon.kind === 'burst' && summon.sprite === sprite);
const burning = (game, sprite) =>
  bursts(game, sprite).filter((burst) => burst.time < fxLength(sprite));

// moves the kit's own kinds as update-effects.js does, and plays the bursts as update-summons.js
// does; the shared motes and sparks only age
function age(game) {
  for (const particle of game.particles) {
    particle.life--;
    KIT.particles[particle.kind]?.(particle, terrain);
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
  game.summons.forEach((burst) => burst.time++);
  game.summons = game.summons.filter((burst) => burst.time < fxLength(burst.sprite));
}

// one tick of a move's dressing, as sim/fx/heavy-feel.js runs it
function dressTick(game, { fighter, move, time }) {
  if (time === 0) {
    KIT.windup(game, fighter, move);
  }
  if (time < move.startup) {
    KIT.gather(game, fighter, move, time);
  }
  if (time === move.startup) {
    KIT.release(game, fighter, move);
  }
  if (time >= move.startup && time < activeEnd(move)) {
    KIT.trail(game, fighter, move, time);
  }
}

const blow = (fighter, move) => ({ attacker: fighter, target: {}, move, x: 120, y: FLOOR - 20 });

// plays a move's dressing tick by tick, landing a blow on `hits`; the most particles alive at once
function playMove(game, { fighter, move, hits = [], ticks = moveLength(move) }) {
  let most = 0;
  for (let time = 0; time < ticks; time++) {
    dressTick(game, { fighter, move, time });
    if (hits.includes(time)) {
      KIT.impact(game, blow(fighter, move));
    }
    age(game);
    most = Math.max(most, game.particles.length);
  }
  return most;
}

function windUp(game, fighter, move) {
  for (let time = 0; time < move.startup; time++) {
    dressTick(game, { fighter, move, time });
  }
}

function recordingPainter() {
  const painter = { rects: [], color: null };
  painter.use = (color) => Object.assign(painter, { color });
  painter.alpha = () => painter;
  painter.rect = (x, y) => {
    painter.rects.push({ x, y, color: painter.color });
    return painter;
  };
  painter.line = () => painter;
  return painter;
}

describe("the Bokator's heavy", () => {
  beforeEach(() => {
    Math.random = () => {
      throw new Error('the Bokator heavy used Math.random');
    };
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('draws golden breath in, each mote reaching his chest as it fades', () => {
    const game = freshGame(7);
    breathIn(game, { x: 100, y: 80 }, { count: 2, spin: 0.13 });
    const motes = [...game.particles];
    for (let i = 0; i < 8; i++) {
      age(game);
    }
    for (const mote of motes) {
      expect(Math.hypot(mote.x - 100, mote.y - 80)).toBeLessThan(3);
    }
  });

  it('lets gold leaf flutter down and come to rest on the ground, not sink through it', () => {
    const game = freshGame(3);
    shedLeaf(game, { x: 100, y: FLOOR - 6 }, { count: 4, lift: 0.4, direction: 1 });
    for (let i = 0; i < 15; i++) {
      age(game);
    }
    for (const leaf of game.particles) {
      expect(leaf.y).toBeLessThanOrEqual(FLOOR);
    }
  });

  it('kicks bronze dust off his planted feet, but not in the air', () => {
    const grounded = freshGame(1);
    const flying = freshGame(1);
    KIT.release(grounded, hero(), FISTS.K1);
    KIT.release(flying, hero({ airborne: true }), FISTS.AK);
    const dust = (game) => game.particles.filter((particle) => particle.kind === 'bokatorDust');
    expect(dust(grounded).length).toBeGreaterThan(0);
    expect(dust(flying)).toEqual([]);
  });

  it('keeps a whole K K K chain within its share of the particles', () => {
    const game = freshGame(11);
    const fighter = hero();
    const k2 = FISTS.K2;
    const spinHits = [0, 3, 6, 9, 12].map((step) => k2.startup + step);
    const most = Math.max(
      playMove(game, { fighter, move: FISTS.K1, hits: [FISTS.K1.startup + 1], ticks: 22 }),
      playMove(game, { fighter, move: k2, hits: spinHits, ticks: 34 }),
      playMove(game, { fighter, move: FISTS.K3, hits: [FISTS.K3.startup + 2] }),
    );
    expect(most).toBeLessThanOrEqual(60);
  });

  // the owner found the hand-drawn lion face behind him wrong; his ultimate's own strips dress it
  it('draws no face behind him: the gold flame of his ultimate rises there instead', () => {
    const game = freshGame(2);
    windUp(game, hero(), FISTS.K1);
    const [flame] = bursts(game, 'gather');
    expect(BOKATOR_HEAVY_RENDER.under).toBeNull();
    expect(bursts(game, 'gather')).toHaveLength(1);
    expect(flame).toMatchObject({ behind: true, y: FLOOR, direction: 1 });
    expect(flame.x).toBeLessThan(100);
  });

  it('lights the flame so it burns fullest as he strikes, however short the wind-up', () => {
    const peak = fxLength('gather') / 2;
    expect(FISTS.K1.startup - flameTick(FISTS.K1)).toBe(peak);
    expect(flameTick(FISTS.K3)).toBe(0);
    expect(flameTick(heroMoves('bokator', 'axe').K1)).toBe(
      heroMoves('bokator', 'axe').K1.startup - peak,
    );
  });

  it('coils a fully charged blow in the full flame and cracks the road as he plants', () => {
    const plain = freshGame(4);
    const charged = freshGame(4);
    windUp(plain, hero(), FISTS.K1);
    windUp(charged, hero(), FISTS.C2);
    dressTick(charged, { fighter: hero(), move: FISTS.C2, time: FISTS.C2.startup });
    expect(bursts(charged, 'gather')[0].scale).toBeGreaterThan(bursts(plain, 'gather')[0].scale);
    expect(bursts(charged, 'pounce')).toHaveLength(1);
    expect(bursts(plain, 'pounce')).toEqual([]);
  });

  it('leaves no flame hanging in the air, and flares a gold star from his chest instead', () => {
    const game = freshGame(6);
    const fighter = hero({ airborne: true, y: FLOOR - 30 });
    windUp(game, fighter, FISTS.AK);
    expect(game.summons).toEqual([]);
    dressTick(game, { fighter, move: FISTS.AK, time: FISTS.AK.startup });
    expect(bursts(game, 'strike')).toEqual([
      expect.objectContaining({ x: 103, y: FLOOR - 50, behind: false }),
    ]);
    expect(bursts(game, 'gather')).toEqual([]);
  });

  it('spends the flame into the blow that lands, breaking it into gold leaf', () => {
    const game = freshGame(8);
    const fighter = hero();
    windUp(game, fighter, FISTS.K1);
    const leaves = game.particles.filter((particle) => particle.kind === 'bokatorLeaf').length;
    KIT.impact(game, blow(fighter, FISTS.K1));
    const after = game.particles.filter((particle) => particle.kind === 'bokatorLeaf').length;
    expect(burning(game, 'gather')).toEqual([]);
    expect(after).toBeGreaterThan(leaves + 3);
  });

  it('spends the flame all the same a few ticks after a strike that lands nothing', () => {
    const game = freshGame(9);
    const fighter = hero();
    const move = FISTS.K2;
    windUp(game, fighter, move);
    for (let time = move.startup; time < move.startup + FLAME_HOLD; time++) {
      dressTick(game, { fighter, move, time });
    }
    expect(burning(game, 'gather')).toHaveLength(1);
    dressTick(game, { fighter, move, time: move.startup + FLAME_HOLD });
    expect(burning(game, 'gather')).toEqual([]);
  });

  it('lands a gold fist-star on each blow, and on a flurry only now and then', () => {
    const single = freshGame(10);
    const flurry = freshGame(10);
    KIT.impact(single, blow(hero(), FISTS.K1));
    KIT.impact(flurry, blow(hero(), FISTS.K2));
    KIT.impact(flurry, blow(hero(), FISTS.K2));
    expect(bursts(single, 'strike')).toHaveLength(1);
    expect(bursts(flurry, 'strike')).toHaveLength(1);
    expect(bursts(flurry, 'strike')[0].scale).toBeLessThan(bursts(single, 'strike')[0].scale);
  });

  it('lifts a launched raider on a column of gold rising from the ground under him', () => {
    const launched = freshGame(12);
    const struck = freshGame(12);
    const aloft = freshGame(12);
    KIT.impact(launched, blow(hero(), FISTS.UK));
    KIT.impact(struck, blow(hero(), FISTS.K1));
    KIT.impact(aloft, blow(hero({ airborne: true, y: FLOOR - 30 }), FISTS.UK));
    expect(bursts(launched, 'awaken')).toEqual([
      expect.objectContaining({ x: 120, y: FLOOR, behind: true }),
    ]);
    expect(bursts(struck, 'awaken')).toEqual([]);
    expect(bursts(aloft, 'awaken')).toEqual([]);
  });

  it('draws every kind of its own and the chest star without Math.random', () => {
    const game = freshGame(5);
    const fighter = hero();
    const move = FISTS.K1;
    playMove(game, { fighter, move, hits: [move.startup], ticks: move.startup + 1 });
    const painter = recordingPainter();
    for (const particle of game.particles) {
      BOKATOR_HEAVY_RENDER.particles[particle.kind]?.(painter, particle);
    }
    const time = move.startup - 1;
    BOKATOR_HEAVY_RENDER.over(painter, { fighter, move, time, art: ART, tickCount: 0 });
    expect(painter.rects.some((rect) => rect.color === ART.core)).toBe(true);
    expect(painter.rects.length).toBeGreaterThan(10);
  });

  it('drives a roundhouse through harder than a launcher, which stays under its raider', () => {
    const { moves, lunge } = BOKATOR_HEAVY_FEEL;
    expect(moves.K1.lunge).toBeGreaterThan(lunge);
    expect(moves.UK.lunge).toBeLessThan(lunge);
  });
});
