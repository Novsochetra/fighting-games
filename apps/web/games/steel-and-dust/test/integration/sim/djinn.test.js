import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { jump, startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function djinnArena({ gap = 150, hp, heroX = 120 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 6;
  game.arena = { left: 0, right: 384 };
  game.player.x = heroX;
  spawnEnemy(game, 'djinn', 1);
  const djinn = game.boss;
  Object.assign(djinn, { entering: false, x: game.player.x + gap, facing: -1 });
  djinn.hp = hp ?? djinn.maxHp;
  djinn.ai.cooldown = 9999;
  return { game, djinn };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, djinn, ticks, everyTick = () => {}) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    djinn.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);

describe('the Storm Djinn in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(7);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('punches a bolt along the floor that knocks down a hero who stands, and not one who jumps', () => {
    const standing = djinnArena();
    startMove(standing.game, standing.djinn, 'thunderFist');
    expect(playOut(standing.game, standing.djinn, 90).has('juggle')).toBe(true);
    const jumping = djinnArena();
    startMove(jumping.game, jumping.djinn, 'thunderFist');
    playOut(jumping.game, jumping.djinn, 46);
    const bolt = shotsOf(jumping.game, 'thunderBolt')[0];
    expect(bolt.y).toBeGreaterThan(bolt.floor - 12);
    jump(jumping.game, jumping.game.player, { vy: -5.8, vx: 0 });
    const states = playOut(jumping.game, jumping.djinn, 40);
    expect(states.has('juggle')).toBe(false);
    expect(jumping.game.player.hp).toBe(jumping.game.player.maxHp);
  });

  it('raises a dust devil that drifts to a hero who stands, pulls them in and throws them high', () => {
    const { game, djinn } = djinnArena();
    startMove(game, djinn, 'dustDevil');
    let highest = game.player.y;
    let pulled = false;
    playOut(game, djinn, 220, () => {
      highest = Math.min(highest, game.player.y);
      pulled = pulled || game.player.x > 121;
    });
    expect(pulled).toBe(true);
    expect(game.player.maxHp - game.player.hp).toBe(10);
    expect(highest).toBeLessThan(game.player.y - 50);
    expect(shotsOf(game, 'dustDevil')).toHaveLength(0);
  });

  it('cannot catch a hero who walks away from it', () => {
    const { game, djinn } = djinnArena({ gap: 200 });
    game.player.x = 200;
    djinn.x = 360;
    startMove(game, djinn, 'dustDevil');
    playOut(game, djinn, 330, () => {
      game.player.facing = -1;
      game.input.held.left = true;
    });
    expect(game.player.hp).toBe(game.player.maxHp);
  });

  it('below half health raises the second devil on the far side of the hero', () => {
    const { game, djinn } = djinnArena({ hp: 130 });
    startMove(game, djinn, 'dustDevils');
    playOut(game, djinn, 40);
    const [ahead, behind] = shotsOf(game, 'dustDevil').map((devil) => devil.x - game.player.x);
    expect(Math.sign(ahead)).toBe(1);
    expect(Math.sign(behind)).toBe(-1);
  });

  it('marks three waves of lightning, then one great strike on the hero, flashing as each lands', () => {
    const { game, djinn } = djinnArena({ hp: 100, heroX: 192 });
    game.player.invincible = 9999;
    startMove(game, djinn, 'eyeOfStorm');
    const marked = new Set();
    let flashes = 0;
    playOut(game, djinn, 450, () => {
      shotsOf(game, 'stormStrike').forEach((strike) => marked.add(strike));
      flashes += game.flashTime > 0 ? 1 : 0;
    });
    expect([...marked].filter((strike) => !strike.great)).toHaveLength(12);
    expect([...marked].filter((strike) => strike.great)).toHaveLength(1);
    expect(flashes).toBeGreaterThan(0);
    expect(djinn.move).toBeNull();
  });

  it('strikes a hero who stands on a mark, and not one who steps off it in time', () => {
    const struck = djinnArena({ hp: 100 });
    startMove(struck.game, struck.djinn, 'eyeOfStorm');
    playOut(struck.game, struck.djinn, 140);
    expect(struck.game.player.hp).toBeLessThan(struck.game.player.maxHp);
    const dodged = djinnArena({ hp: 100 });
    startMove(dodged.game, dodged.djinn, 'eyeOfStorm');
    playOut(dodged.game, dodged.djinn, 140, (i) => {
      if (i === 90) {
        dodged.game.player.x += 32;
      }
    });
    expect(dodged.game.player.hp).toBe(dodged.game.player.maxHp);
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of his kit', () => {
    const { game, djinn } = djinnArena({ hp: 100 });
    djinn.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 4800; i++) {
      if (i % 600 === 0) {
        game.player.x = djinn.x > 192 ? 20 : 364;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      djinn.hp = Math.max(djinn.hp, 40);
      used.add(djinn.move?.id);
    }
    expect([...used]).toEqual(expect.arrayContaining(['thunderFist', 'dustDevils', 'eyeOfStorm']));
  });
});
