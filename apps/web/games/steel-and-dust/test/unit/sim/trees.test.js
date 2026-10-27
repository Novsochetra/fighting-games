import { describe, expect, it } from 'vitest';
import { TREE } from '../../../src/data/trees.js';
import { treeFrame } from '../../../src/render/scene/trees.js';
import { createTrees, fellTreesIn, trunkBox, updateTrees } from '../../../src/sim/hazards/trees.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const STUMP = 300;

function forestGame() {
  const { game, sounds } = createLootGame();
  game.player.x = STUMP - TREE.reach - 60;
  game.trees = createTrees([{ x: STUMP, y: game.player.y }]);

  return { game, sounds, tree: game.trees[0] };
}

function strikeTrunk(game, direction) {
  const trunk = trunkBox(game.trees[0]);

  fellTreesIn(game, { x: trunk.x - 4, y: trunk.y + 60, width: 12, height: 12 }, direction);
}

function untilLanded(game) {
  for (let i = 0; i < TREE.creak + TREE.fall; i++) {
    updateTrees(game);
  }
}

describe('a dead tree', () => {
  it('creaks when struck, then falls the way the blow went and lands', () => {
    const { game, sounds, tree } = forestGame();

    strikeTrunk(game, -1);
    expect(tree).toMatchObject({ state: 'creaking', direction: -1 });
    untilLanded(game);

    expect(tree.state).toBe('fallen');
    expect(soundKeys(sounds)).toEqual(['creak', 'timber']);
  });

  it('is not felled by a blow that misses its trunk', () => {
    const { game, tree } = forestGame();

    fellTreesIn(game, { x: STUMP + 30, y: tree.y - 40, width: 12, height: 12 }, 1);

    expect(tree.state).toBe('standing');
  });

  it('crushes the raiders it comes down on, and spares the one behind it', () => {
    const { game } = forestGame();
    const under = spawnEnemy(game, 'grunt', STUMP + 60);
    const tip = spawnEnemy(game, 'brute', STUMP + TREE.reach - 6);
    const behind = spawnEnemy(game, 'grunt', STUMP - 40);

    strikeTrunk(game, 1);
    untilLanded(game);

    expect(under.state).toBe('ko');
    expect(tip.hp).toBeLessThan(tip.def.hp);
    expect(behind.hp).toBe(behind.def.hp);
  });

  it('hurts the hero standing under it, but not one in the air above it', () => {
    const { game } = forestGame();
    const before = game.player.hp;
    game.player.x = STUMP + 50;

    strikeTrunk(game, 1);
    untilLanded(game);
    const crushed = game.player.hp;
    expect(crushed).toBeLessThan(before);
    expect(crushed).toBeGreaterThan(0);

    const second = forestGame();
    Object.assign(second.game.player, { x: STUMP + 50, y: second.tree.y - TREE.depth - 50 });
    strikeTrunk(second.game, 1);
    untilLanded(second.game);
    expect(second.game.player.hp).toBe(before);
  });

  it('falls only once', () => {
    const { game, sounds, tree } = forestGame();

    strikeTrunk(game, 1);
    untilLanded(game);
    strikeTrunk(game, -1);
    untilLanded(game);

    expect(tree).toMatchObject({ state: 'fallen', direction: 1 });
    expect(soundKeys(sounds)).toEqual(['creak', 'timber']);
  });

  it('rocks as it creaks, then leans, falls and lies', () => {
    const frames = [0, 3, 6, TREE.creak - 2].map((time) => treeFrame({ state: 'creaking', time }));

    expect(treeFrame({ state: 'standing', time: 0 })).toBe(0);
    expect(frames).toEqual([0, 1, 0, 1]);
    expect(treeFrame({ state: 'falling', time: 2 })).toBe(2);
    expect(treeFrame({ state: 'fallen', time: 0 })).toBe(3);
  });
});
