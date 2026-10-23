import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ULT_FULL, ULT_MAX } from '../../../src/config.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

function fightOneRaider() {
  const sounds = [];
  const game = createPlayingGame({ io: { sfx: (key) => sounds.push(key) } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 16, hp: 500 });
  raider.maxHp = 500;
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  return { game, raider, sounds };
}

function untilIdle(game) {
  for (let i = 0; i < 120 && game.player.state !== 'idle'; i++) {
    runTicks(game, 1);
  }
}

describe('heavy spends the bar and light fills it', () => {
  beforeEach(() => {
    Math.random = seededRandom(4);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('does nothing on an empty bar but say so', () => {
    const { game, raider, sounds } = fightOneRaider();
    game.ultMeter = 0;
    tap(game, 'heavy');
    runTicks(game, 30);
    expect(game.player.state).toBe('idle');
    expect(raider.hp).toBe(500);
    expect(sounds).toContain('heavyEmpty');
    expect(game.floaters.some((floater) => floater.text === 'No power')).toBe(true);
    expect(game.hint?.id).toBe('heavyBar');
  });

  it('will not even start a charge on an empty bar', () => {
    const { game } = fightOneRaider();
    game.ultMeter = 0;
    press(game, 'heavy');
    runTicks(game, 40);
    release(game, 'heavy');
    expect(game.player.state).not.toBe('charge');
    expect(game.player.move).toBeNull();
  });

  it('fills from light blows until a heavy can be paid for, which then lands and spends it', () => {
    const { game, raider, sounds } = fightOneRaider();
    game.ultMeter = 0;
    tap(game, 'light');
    untilIdle(game);
    expect(game.ultMeter).toBeGreaterThan(0);
    game.ultMeter = 12;
    const hp = raider.hp;
    tap(game, 'heavy');
    runTicks(game, 30);
    expect(raider.hp).toBeLessThan(hp);
    expect(game.ultMeter).toBe(2);
    expect(sounds).toContain('heavyMossCharge');
  });

  it('runs dry when only heavy is pressed', () => {
    const { game, raider } = fightOneRaider();
    game.ultMeter = 30;
    for (let i = 0; i < 12; i++) {
      tap(game, 'heavy');
      untilIdle(game);
      raider.ai.cooldown = 9999;
    }
    const hp = raider.hp;
    tap(game, 'heavy');
    untilIdle(game);
    expect(game.ultMeter).toBe(0);
    expect(raider.hp).toBe(hp);
  });

  it('keeps a second ultimate after the first, so heavies can be paid for and a ULT still let go', () => {
    const { game } = fightOneRaider();
    game.ultMeter = ULT_MAX;
    tap(game, 'ult');
    expect(game.player.state).toBe('ult');
    expect(game.ultMeter).toBe(ULT_FULL);
  });
});
