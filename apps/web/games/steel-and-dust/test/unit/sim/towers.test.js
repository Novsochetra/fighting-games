import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STONES, TOWER } from '../../../src/data/towers.js';
import { towerFrame } from '../../../src/render/scene/towers.js';
import { stoneSpots, stoneY } from '../../../src/sim/hazards/tower-stones.js';
import {
  crackTowersIn,
  createTowers,
  towerBox,
  updateTowers,
} from '../../../src/sim/hazards/towers.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { seededRandom } from '../../support/seeded-random.js';

const SPOT = 250;
const COMES_APART = TOWER.crack;
const originalRandom = Math.random;

function towerGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 140;
  game.towers = createTowers([{ x: SPOT, y: game.player.y }]);

  return { game, sounds, tower: game.towers[0] };
}

function strikeTower(game, direction) {
  const body = towerBox(game.towers[0]);

  crackTowersIn(game, { x: body.x - 4, y: body.y + 30, width: 12, height: 12 }, direction);
}

function runTowers(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateTowers(game);
  }
}

// struck and come apart, its stones' shadows on the road and none of them landed yet
function comeApart(game, direction = 1) {
  strikeTower(game, direction);
  runTowers(game, COMES_APART);

  return game.towers[0].stones;
}

describe('a face tower', () => {
  beforeEach(() => {
    Math.random = seededRandom(3);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('creaks when struck, then comes apart with a crash and is gone', () => {
    const { game, sounds, tower } = towerGame();

    strikeTower(game, -1);
    expect(tower).toMatchObject({ state: 'cracking', direction: -1 });
    runTowers(game, COMES_APART);
    expect(tower.state).toBe('breaking');
    runTowers(game, TOWER.apart);

    expect(tower.state).toBe('gone');
    expect(soundKeys(sounds)).toEqual(['creak', 'crumble']);
  });

  it('is not cracked by a blow that misses it, and comes apart only once', () => {
    const { game, sounds, tower } = towerGame();

    crackTowersIn(game, { x: SPOT + 40, y: tower.y - 30, width: 12, height: 12 }, 1);
    expect(tower.state).toBe('standing');

    comeApart(game);
    runTowers(game, 200);
    strikeTower(game, 1);
    runTowers(game, 200);

    expect(soundKeys(sounds).filter((key) => key === 'crumble')).toHaveLength(1);
  });

  it('marks a spot for each stone in each stretch of half a screen around it', () => {
    const { game } = towerGame();
    const stones = comeApart(game, 1);
    const stretch = (STONES.spread * 2) / STONES.count;

    expect(stones).toHaveLength(STONES.count);
    stones.forEach((stone, i) => {
      const from = SPOT - STONES.spread + stretch * i;

      expect(stone.x).toBeGreaterThan(from);
      expect(stone.x).toBeLessThan(from + stretch);
      expect(stone.floor).toBe(game.player.y);
    });
  });

  it('drops its stones one after another the way the blow went', () => {
    const towards = stoneSpots({ x: SPOT, direction: 1 });
    const back = stoneSpots({ x: SPOT, direction: -1 });

    expect(towards).toEqual([...towards].sort((first, second) => first - second));
    expect(back).toEqual([...back].sort((first, second) => second - first));
  });

  it('lands each stone on its shadow after a moment, from out of sight', () => {
    const stone = { floor: 184, time: 0, land: STONES.lead };
    const drop = [12, 6, 2, 0].map((left) => stoneY({ ...stone, time: STONES.lead - left }));

    expect(stoneY(stone)).toBeLessThan(0);
    expect(stoneY({ ...stone, time: STONES.lead - STONES.fall })).toBeLessThan(0);
    expect(drop).toEqual([...drop].sort((first, second) => first - second));
    expect(drop.at(-2)).toBeGreaterThan(150);
    expect(drop.at(-1)).toBe(184);
  });

  it('crushes the raiders under a stone and spares the one between the shadows', () => {
    const { game, sounds } = towerGame();
    const [first, second] = comeApart(game);
    Object.assign(first, { x: SPOT - 60 });
    Object.assign(second, { x: SPOT + 20 });
    const under = spawnEnemy(game, 'grunt', SPOT - 60);
    const heavy = spawnEnemy(game, 'juggernaut', SPOT + 24);
    const between = spawnEnemy(game, 'grunt', SPOT - 20);

    runTowers(game, second.land);

    expect(under.state).toBe('ko');
    expect(heavy.hp).toBeLessThan(heavy.def.hp);
    expect(between.hp).toBe(between.def.hp);
    expect(soundKeys(sounds).filter((key) => key === 'break')).toHaveLength(2);
  });

  it('hurts the hero under a shadow, even in a jump, and not beside it', () => {
    const { game } = towerGame();
    const [stone] = comeApart(game);
    const before = game.player.hp;
    Object.assign(stone, { x: SPOT - 60 });
    game.player.x = SPOT - 60 + STONES.halfWidth + 8;

    runTowers(game, stone.land);
    expect(game.player.hp).toBe(before);

    const second = towerGame();
    const [next] = comeApart(second.game);
    Object.assign(next, { x: SPOT - 60 });
    Object.assign(second.game.player, { x: SPOT - 60, y: next.floor - 30, airborne: true });
    runTowers(second.game, next.land);
    expect(second.game.player.hp).toBeLessThan(before);
    expect(second.game.player.hp).toBeGreaterThan(0);
  });

  it('rocks as it creaks, holds cracked, comes apart and is gone', () => {
    const frames = [0, 3, 6, TOWER.crack - 2].map((time) =>
      towerFrame({ state: 'cracking', time }),
    );

    expect(towerFrame({ state: 'standing', time: 0 })).toBe(0);
    expect(frames).toEqual([0, 1, 0, 1]);
    expect(towerFrame({ state: 'breaking', time: 2 })).toBe(2);
    expect(towerFrame({ state: 'gone', time: 0 })).toBeNull();
  });
});
