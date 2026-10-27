import { describe, expect, it } from 'vitest';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { createTestGame, runTicks } from '../../support/test-game.js';

const RAIDER_CAMP = 3;
// a heavy finisher's knockback, which sends a raider tumbling along the road
const FINISHER = { damage: 5, knockback: [4.5, -3], knockdown: true, hitstop: 6, hitstun: 20 };

function campGame() {
  const game = createTestGame();
  selectMission(game, RAIDER_CAMP);
  startPlay(game);
  game.fighters = [game.player];
  return game;
}

// the hero stands well clear of the keg with a raider between them, all of them on screen
function lineUp(game, keg) {
  Object.assign(game.player, { x: keg.x - 70, y: keg.y, facing: 1 });
  game.camera.x = keg.x - 192;
  const raider = createFighter('enemy', 'grunt', keg.x - 54, keg.y);
  raider.facing = -1;
  game.fighters.push(raider);
  return raider;
}

describe('the powder kegs of the raider camp', () => {
  it('stand on the camp road', () => {
    const game = campGame();

    expect(game.kegs.length).toBeGreaterThanOrEqual(5);
    expect(game.kegs.every((keg) => !keg.lit && !keg.gone)).toBe(true);
  });

  it('blow up a raider knocked into one, and spare the hero standing clear', () => {
    const game = campGame();
    const [keg] = game.kegs;
    const raider = lineUp(game, keg);
    const heroHp = game.player.hp;

    applyHit(game, {
      attacker: game.player,
      target: raider,
      move: FINISHER,
      x: raider.x,
      y: raider.y - 20,
    });
    // the raider's tumble reaches the keg and sets it off before he is back on his feet
    runTicks(game, 40);

    expect(keg.gone).toBe(true);
    expect(raider.state).toBe('ko');
    expect(game.player.hp).toBe(heroHp);
  });
});
