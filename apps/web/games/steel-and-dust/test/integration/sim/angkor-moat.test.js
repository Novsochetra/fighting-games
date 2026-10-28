import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MOAT } from '../../../src/data/moat.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { groundAt } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, press, runTicks, tap } from '../../support/test-game.js';

const ANGKOR_WAT = 10;
const originalRandom = Math.random;
// a heavy hit that knocks a raider down and a little way along the road
const KNOCK = { damage: 5, knockback: [2.4, -2.6], knockdown: true, hitstop: 6, hitstun: 20 };

// the hero on the near bank of the causeway's breach, and all of it on screen
function causewayGame(heroX) {
  const game = createTestGame();
  selectMission(game, ANGKOR_WAT);
  startPlay(game);
  const [moat] = game.terrain.water;
  const x = heroX(moat);
  game.fighters = [game.player];
  Object.assign(game.player, { x, y: groundAt(game.terrain, x), facing: 1 });
  game.camera.x = moat.from - 192;

  return { game, moat };
}

function raiderAt(game, x, facing) {
  const raider = createFighter('enemy', 'grunt', x, groundAt(game.terrain, x));
  raider.facing = facing;
  game.fighters.push(raider);

  return raider;
}

describe('the moat across the Naga Causeway', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('rings out a raider knocked off the edge, however much health it has left', () => {
    const { game, moat } = causewayGame((span) => span.from - 30);
    const raider = raiderAt(game, moat.from - 8, -1);
    const score = game.score;

    applyHit(game, {
      attacker: game.player,
      target: raider,
      move: KNOCK,
      x: raider.x,
      y: raider.y,
    });
    runTicks(game, 60);

    expect(raider.hp).toBeGreaterThan(0);
    expect(game.fighters).not.toContain(raider);
    expect(game.score).toBeGreaterThan(score + MOAT.ringOutBonus);
  });

  it('is leapt by a raider on the far side coming for the hero', () => {
    const { game, moat } = causewayGame((span) => span.from - 40);
    const raider = raiderAt(game, moat.to + 30, -1);

    runTicks(game, 160);

    expect(game.fighters).toContain(raider);
    expect(raider.x).toBeLessThan(moat.from);
  });

  it('stops the hero running at its edge, and a running jump clears it', () => {
    const { game, moat } = causewayGame((span) => span.from - 60);
    const bank = groundAt(game.terrain, moat.from - 1);

    press(game, 'right');
    runTicks(game, 60);
    expect(game.player.x).toBeLessThan(moat.from);
    expect(game.player.y).toBe(bank);

    tap(game, 'jump');
    runTicks(game, 60);
    expect(game.player.x).toBeGreaterThan(moat.to);
    expect(game.player.y).toBe(bank);
  });
});
