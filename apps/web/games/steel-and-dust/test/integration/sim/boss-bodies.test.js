import { describe, expect, it } from 'vitest';
import { hurtBox, overlaps, swingBox } from '../../../src/sim/combat/boxes.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

function arena(kind, gap) {
  const game = createPlayingGame();
  game.arena = { left: 0, right: 400 };
  game.player.x = 140;
  game.player.invincible = 9999;
  spawnEnemy(game, kind, 1);
  const boss = game.boss;
  Object.assign(boss, { entering: false, x: game.player.x + gap, facing: -1 });
  boss.ai.cooldown = 9999;
  return { game, boss };
}

describe('a boss drawn at its size in a fight', () => {
  it('keeps the hero off its body, so nobody stands inside its art', () => {
    const { game, boss } = arena('colossus', 8);
    runTicks(game, 60);
    const [left, , width] = boss.def.hurtShape;
    expect(Math.abs(boss.x - game.player.x)).toBeGreaterThan((width - left) * boss.scale * 0.8);
  });

  it('lands its swipe on a hero at the tip of the blade it swings', () => {
    const { game, boss } = arena('khan', 66);
    startMove(game, boss, 'swipe');
    boss.moveTime = boss.move.startup;
    expect(overlaps(swingBox(boss), hurtBox(game.player))).toBe(true);
  });

  it('takes a blow on the shoulder its art is drawn with', () => {
    const { boss } = arena('colossus', 60);
    const shoulder = { x: boss.x - 30, y: boss.y - 70, width: 4, height: 4 };
    expect(overlaps(shoulder, hurtBox(boss))).toBe(true);
  });
});
