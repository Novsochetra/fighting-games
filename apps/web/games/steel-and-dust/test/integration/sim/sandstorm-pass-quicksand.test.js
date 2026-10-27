import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QUICKSAND } from '../../../src/data/quicksand.js';
import { applyHit } from '../../../src/sim/combat/apply-hit.js';
import { createFighter } from '../../../src/sim/fighters/create-fighter.js';
import { selectMission, startPlay } from '../../../src/sim/stage/flow.js';
import { missionOf } from '../../../src/sim/stage/mission.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createTestGame, press, runTicks, tap } from '../../support/test-game.js';

const SANDSTORM_PASS = 6;
const originalRandom = Math.random;
// a hit that knocks a raider down a little way along the road
const KNOCK = { damage: 4, knockback: [1.4, -2], knockdown: true, hitstop: 6, hitstun: 20 };

// the first fight's patch, on its last wave so no more raiders walk in
function atThePatch() {
  const game = createTestGame();
  selectMission(game, SANDSTORM_PASS);
  startPlay(game);
  const [patch] = game.quicksand;
  const zone = missionOf(game).zones[0];
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { zoneIndex: 0, waveIndex: zone.waves.length - 1 });
  game.fighters = [game.player];
  Object.assign(game.player, { x: patch.x - 40, y: patch.y, facing: 1 });
  game.camera.x = patch.x - 192;

  return { game, patch };
}

function runRightFor(game, ticks) {
  const from = game.player.x;
  press(game, 'right');
  runTicks(game, ticks);

  return game.player.x - from;
}

describe('the quicksand of Sandstorm Pass', () => {
  beforeEach(() => {
    Math.random = seededRandom(21);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('holds a raider knocked into it until it swallows it, and leaves its purse on the rim', () => {
    const { game, patch } = atThePatch();
    const raider = createFighter('enemy', 'grunt', patch.x - 14, patch.y);
    raider.facing = -1;
    game.fighters.push(raider);

    applyHit(game, { attacker: game.player, target: raider, move: KNOCK, x: raider.x, y: patch.y });
    runTicks(game, 50);
    expect(raider.state).toBe('hurt');
    expect(raider.sunk).toBeGreaterThan(0);
    runTicks(game, 160);

    expect(raider.removed).toBe(true);
    expect(game.fighters).not.toContain(raider);
    expect(game.player.hp).toBe(game.player.maxHp);
    expect(game.loot.length).toBeGreaterThan(0);
    for (const coin of game.loot) {
      expect(Math.abs(coin.x - patch.x)).toBeGreaterThan(QUICKSAND.halfWidth);
    }
  });

  it('slows the hero running through it', () => {
    const sand = atThePatch();
    const road = atThePatch();
    road.game.quicksand = [];

    expect(runRightFor(sand.game, 60)).toBeLessThan(runRightFor(road.game, 60) - 20);
  });

  it('lets the hero jump out of it', () => {
    const { game, patch } = atThePatch();
    game.player.x = patch.x;
    runTicks(game, 120);
    expect(game.player.sunk).toBeGreaterThan(0);

    press(game, 'right');
    tap(game, 'jump');
    runTicks(game, 50);

    expect(game.player.x).toBeGreaterThan(patch.x + QUICKSAND.halfWidth);
    expect(game.player.sunk).toBeFalsy();
  });

  it('throws out a hero who stays in it, hurt but still standing', () => {
    const { game, patch } = atThePatch();
    game.player.x = patch.x + 3;
    const hp = game.player.hp;

    runTicks(game, Math.ceil(QUICKSAND.heroDepth / QUICKSAND.heroSink) + 90);

    expect(Math.abs(game.player.x - patch.x)).toBeGreaterThan(QUICKSAND.halfWidth);
    expect(game.player.hp).toBeLessThan(hp);
    expect(game.player.hp).toBeGreaterThan(0);
  });
});
