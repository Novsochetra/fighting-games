import { describe, expect, it } from 'vitest';
import { songFor } from '../../../src/audio/music/song-for.js';
import { ULT_FULL } from '../../../src/config.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { knockOut } from '../../../src/sim/combat/knock-out.js';
import { createLootGame, spawnEnemy } from '../../support/loot-game.js';
import { runTicks, tap } from '../../support/test-game.js';

// the mission's boss felled beside the hero, the loot time just begun
function afterTheBoss() {
  const { game, sounds } = createLootGame();
  runTicks(game, 2);
  const boss = spawnEnemy(game, 'khan', game.player.x + 90);
  game.boss = boss;
  knockOut(game, boss, 1);
  runTicks(game, 60);
  return { game, sounds, boss };
}

const blow = (attacker, target) => ({
  attacker,
  target,
  move: { damage: 40, hitstop: 4, knockback: 2 },
  x: target.x,
  y: target.y - 16,
});

describe('after the mission boss falls', () => {
  it('nothing left on the road can hurt the hero, in the loot time or over the clear', () => {
    const { game, boss } = afterTheBoss();
    const hp = game.player.hp;
    expect(applyHit(game, blow(boss, game.player))).toBe(false);
    game.lootTime = 0;
    game.clearTime = 40;
    expect(applyHit(game, blow(boss, game.player))).toBe(false);
    expect(game.player.hp).toBe(hp);
  });

  it('refuses an ultimate, so the bar carries into the next mission whole', () => {
    const { game } = afterTheBoss();
    game.ultMeter = ULT_FULL;
    tap(game, 'ult');
    runTicks(game, 10);
    expect(game.ultMeter).toBe(ULT_FULL);
    expect(game.player.state).not.toBe('ult');
  });

  it('stops the clock, quiets the music and shows no new tips', () => {
    const { game } = afterTheBoss();
    const playTime = game.playTime;
    game.ultMeter = ULT_FULL;
    game.hint = null;
    runTicks(game, 60);
    expect(game.playTime).toBe(playTime);
    expect(songFor(game)).toBeNull();
    expect(game.hint).toBeNull();
  });

  it('a raider still standing then falls with the boss and is not replaced', () => {
    const { game } = createLootGame();
    runTicks(game, 2);
    const raider = spawnEnemy(game, 'grunt', game.player.x - 40);
    const boss = spawnEnemy(game, 'khan', game.player.x + 90);
    game.boss = boss;
    knockOut(game, boss, 1);
    runTicks(game, 120);
    expect(raider.state === 'ko' || raider.removed).toBe(true);
    const standing = game.fighters.filter(
      (fighter) => fighter.side === 'enemy' && fighter.state !== 'ko',
    );
    expect(standing).toEqual([]);
  });
});
