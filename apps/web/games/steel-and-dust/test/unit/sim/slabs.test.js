import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from '../../../src/data/difficulty.js';
import { SLAB } from '../../../src/data/slabs.js';
import { slabFrame } from '../../../src/render/scene/slabs.js';
import { damageOf } from '../../../src/sim/combat/hit-damage.js';
import { fallMove } from '../../../src/sim/hazards/slab-fall.js';
import { comesDownHard, createSlabs, updateSlabs } from '../../../src/sim/hazards/slabs.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const SPOT = 250;
const DIVE = { dive: [1, 6] };

function galleryGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 120;
  game.slabs = createSlabs([{ x: SPOT, y: game.player.y }]);

  return { game, sounds, slab: game.slabs[0] };
}

// a body comes down onto the floor at `x` in `state`, and lies or stands there `after`
function comeDown(game, fighter, { x, state, after }) {
  const floor = game.slabs[0].y;

  Object.assign(fighter, { x, y: floor - 12, vy: 4, airborne: true, state });
  updateSlabs(game);
  Object.assign(fighter, { y: floor, vy: 0, airborne: false, state: after ?? state });
  updateSlabs(game);
}

function runSlab(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateSlabs(game);
  }
}

const untilItGivesWay = (game) => runSlab(game, SLAB.crack);

describe('what comes down hard on a slab', () => {
  it("is the hero's dive, or a raider thrown or knocked out, on the way down", () => {
    const diving = { side: 'player', state: 'attack', move: DIVE, airborne: true, vy: 6 };
    const thrown = { side: 'enemy', state: 'juggle', airborne: true, vy: 2 };

    expect(comesDownHard(diving)).toBe(true);
    expect(comesDownHard({ ...diving, move: {} })).toBe(false);
    expect(comesDownHard({ side: 'player', state: 'air', airborne: true, vy: 4 })).toBe(false);
    expect(comesDownHard(thrown)).toBe(true);
    expect(comesDownHard({ ...thrown, state: 'ko' })).toBe(true);
    expect(comesDownHard({ ...thrown, vy: -2 })).toBe(false);
    expect(comesDownHard({ side: 'enemy', state: 'air', airborne: true, vy: 3 })).toBe(false);
  });
});

describe('a cracked slab', () => {
  it('starts cracking under a raider thrown down on it, with a creak', () => {
    const { game, sounds, slab } = galleryGame();
    const raider = spawnEnemy(game, 'grunt', SPOT + 60);

    comeDown(game, raider, { x: SPOT + 10, state: 'juggle', after: 'down' });

    expect(slab.state).toBe('cracking');
    expect(soundKeys(sounds)).toEqual(['creak']);
  });

  it("starts cracking under the hero's dive, but not under a jump or a raider beside it", () => {
    const { game, slab } = galleryGame();
    const raider = spawnEnemy(game, 'grunt', SPOT + 100);

    comeDown(game, game.player, { x: SPOT - 4, state: 'air', after: 'idle' });
    comeDown(game, raider, { x: SPOT + SLAB.halfWidth + 6, state: 'juggle', after: 'down' });
    expect(slab.state).toBe('whole');

    game.player.move = DIVE;
    comeDown(game, game.player, { x: SPOT - 4, state: 'attack' });
    expect(slab.state).toBe('cracking');
  });

  it('gives way under the raiders on it, out at once for a bonus each, and spares those off it', () => {
    const { game, slab } = galleryGame();
    const thrown = spawnEnemy(game, 'juggernaut', SPOT + 60);
    const standing = spawnEnemy(game, 'grunt', SPOT - SLAB.halfWidth + 4);
    const beside = spawnEnemy(game, 'grunt', SPOT + SLAB.halfWidth + 8);
    const leaping = spawnEnemy(game, 'grunt', SPOT - 10);
    comeDown(game, thrown, { x: SPOT + 6, state: 'juggle', after: 'down' });
    Object.assign(leaping, { airborne: true, y: slab.y - 30 });
    const score = game.score;

    untilItGivesWay(game);

    expect(thrown).toMatchObject({ removed: true, state: 'ko' });
    expect(standing.removed).toBe(true);
    expect(beside.removed).toBeFalsy();
    expect(leaping.removed).toBeFalsy();
    expect(game.score).toBeGreaterThan(score + 2 * SLAB.fallBonus);
    expect(game.floaters.filter((floater) => floater.text === 'Fell through!')).toHaveLength(1);
  });

  it('throws the hero standing on it out on the nearer edge, hurt and knocked down', () => {
    const { game, sounds, slab } = galleryGame();
    const before = game.player.hp;
    game.player.x = SPOT + 20;
    slab.state = 'cracking';

    untilItGivesWay(game);

    expect(game.player.hp).toBeLessThan(before);
    expect(game.player.state).toBe('juggle');
    expect(game.player.x).toBe(SPOT + SLAB.halfWidth + SLAB.edgeIn);
    expect(game.player.vx).toBeGreaterThan(0);
    expect(soundKeys(sounds)).toContain('crumble');
  });

  it('never knocks out the hero by the fall alone', () => {
    const { game, slab } = galleryGame();
    Object.assign(game.player, { x: SPOT - 20, hp: 1 });
    slab.state = 'cracking';

    untilItGivesWay(game);

    expect(game.player.hp).toBe(1);
    expect(game.player.state).not.toBe('ko');
    expect(game.player.x).toBe(SPOT - SLAB.halfWidth - SLAB.edgeIn);
  });

  it('leaves at most one point of health gone short of the last, on every difficulty', () => {
    const { game } = galleryGame();

    DIFFICULTIES.forEach((_difficulty, difficulty) => {
      game.settings.difficulty = difficulty;
      for (let hp = 1; hp <= 40; hp++) {
        const hero = { ...game.player, hp };
        const move = fallMove(game, hero);

        expect(move === null || damageOf(game, hero, move) < hp, `hp ${hp}`).toBe(true);
      }
    });
  });

  it('lies open as walkable rubble from then on, and breaks only once', () => {
    const { game, sounds, slab } = galleryGame();
    const raider = spawnEnemy(game, 'grunt', SPOT + 80);
    slab.state = 'cracking';
    runSlab(game, SLAB.crack + SLAB.breakUp + 5);

    comeDown(game, raider, { x: SPOT, state: 'juggle', after: 'down' });
    runSlab(game, SLAB.crack + SLAB.breakUp);

    expect(slab.state).toBe('broken');
    expect(raider.removed).toBeFalsy();
    expect(soundKeys(sounds)).toEqual(['crumble']);
  });

  it('flickers as the cracks spread, then breaks up and lies open', () => {
    const frames = [0, 3, 6, SLAB.crack - 1].map((time) => slabFrame({ state: 'cracking', time }));

    expect(slabFrame({ state: 'whole', time: 0 })).toBe(0);
    expect(frames).toEqual([0, 1, 0, 1]);
    expect(slabFrame({ state: 'breaking', time: 2 })).toBe(2);
    expect(slabFrame({ state: 'broken', time: 0 })).toBe(3);
  });
});
