import { describe, expect, it } from 'vitest';
import { GROUND_Y } from '../../../src/config.js';
import { CONVEYOR, FURNACE_SCORCH, beltLength } from '../../../src/data/conveyors.js';
import { createConveyors, updateConveyors } from '../../../src/sim/hazards/conveyors.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';
import { buildTerrain, useTerrain } from '../../support/terrain-game.js';

// a belt two segments long on a level road, running right into a furnace whose mouth is at 300
const MOUTH = 300;
const START = MOUTH - beltLength(2);

function beltGame({ direction = 1, ground = [] } = {}) {
  const { game, sounds } = createLootGame();
  game.player.x = 60;
  useTerrain(game, buildTerrain({ ground }));
  const [from, to] = direction > 0 ? [START, MOUTH] : [MOUTH, MOUTH + beltLength(2)];
  game.conveyors = createConveyors([{ from, to, y: GROUND_Y, direction, segments: 2 }]);

  return { game, sounds, belt: game.conveyors[0] };
}

function run(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateConveyors(game);
  }
}

// a raider knocked down and lying where it fell
function lying(raider) {
  return Object.assign(raider, { state: 'down', stateTime: 0 });
}

describe('a conveyor belt', () => {
  it('carries the hero standing on it toward its furnace at its own pace', () => {
    const { game } = beltGame();
    game.player.x = START + 20;

    run(game, 10);

    expect(game.player.x).toBeCloseTo(START + 20 + 10 * CONVEYOR.speed);
  });

  it('runs the other way on a belt laid the other way', () => {
    const { game } = beltGame({ direction: -1 });
    game.player.x = MOUTH + 60;

    run(game, 10);

    expect(game.player.x).toBeCloseTo(MOUTH + 60 - 10 * CONVEYOR.speed);
  });

  it('leaves alone whoever is off its ends, in the air or frozen in a hit', () => {
    const { game } = beltGame();
    const before = spawnEnemy(game, 'grunt', START - 4);
    const flying = Object.assign(spawnEnemy(game, 'grunt', START + 30), { airborne: true });
    const frozen = Object.assign(spawnEnemy(game, 'grunt', START + 60), { hitstop: 6 });

    run(game, 1);

    expect([before.x, flying.x, frozen.x]).toEqual([START - 4, START + 30, START + 60]);
  });

  it('carries raiders still walking in from off screen only once they are in the fight', () => {
    const { game } = beltGame();
    const entering = Object.assign(spawnEnemy(game, 'grunt', START + 30), { entering: true });

    run(game, 1);

    expect(entering.x).toBe(START + 30);
  });

  it('stops a body at a wall, as every push does', () => {
    const { game } = beltGame({
      ground: [
        [START + 40, 0],
        [START + 40, 20],
        [MOUTH + 40, 20],
      ],
    });
    const raider = lying(spawnEnemy(game, 'grunt', START + 39.8));

    run(game, 10);

    expect(raider.x).toBe(START + 39.8);
  });

  it('carries a boss into the mouth and no further harm comes to it', () => {
    const { game } = beltGame();
    const boss = lying(spawnEnemy(game, 'furnace', MOUTH - 1));

    run(game, 4);

    expect(boss.removed).toBeFalsy();
    expect(boss.x).toBeGreaterThan(MOUTH);
  });
});

describe('a raider on the belt', () => {
  it('lying in the mouth is fed to the furnace, out at once for a bonus, with a roar of fire', () => {
    const { game, sounds } = beltGame();
    const raider = lying(spawnEnemy(game, 'juggernaut', MOUTH - 0.2));
    const score = game.score;

    run(game, 1);

    expect(raider).toMatchObject({ removed: true, state: 'ko' });
    expect(game.score).toBeGreaterThan(score + CONVEYOR.smeltBonus);
    expect(soundKeys(sounds)).toEqual(expect.arrayContaining(['flame', 'ko']));
    expect(game.floaters.map((floater) => floater.text)).toContain('Smelted!');
    expect(game.summons.some((summon) => summon.sprite === 'blaze')).toBe(true);
  });

  it('knocked down short of the mouth is carried there while it lies, then fed', () => {
    const { game } = beltGame();
    const raider = lying(spawnEnemy(game, 'grunt', MOUTH - 10));

    run(game, 19);
    expect(raider.removed).toBeFalsy();
    run(game, 2);

    expect(raider.removed).toBe(true);
  });

  it('getting up is still down, and is fed', () => {
    const { game } = beltGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', MOUTH + 4), { state: 'getup' });

    run(game, 1);

    expect(raider.removed).toBe(true);
  });

  it('slid past the end of the belt into the mouth is fed; one past the mouth is not', () => {
    const { game } = beltGame();
    const inMouth = lying(spawnEnemy(game, 'grunt', MOUTH + CONVEYOR.mouth - 1));
    const beyond = lying(spawnEnemy(game, 'grunt', MOUTH + CONVEYOR.mouth + 6));

    run(game, 1);

    expect(inMouth.removed).toBe(true);
    expect(beyond.removed).toBeFalsy();
  });

  it('walking is only carried, past the mouth and off the belt', () => {
    const { game } = beltGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', MOUTH - 1), { state: 'walk' });

    run(game, 4);

    expect(raider.removed).toBeFalsy();
    expect(raider.hp).toBe(raider.def.hp);
    expect(raider.x).toBeGreaterThan(MOUTH);
  });

  it('walking up it keeps its own pace; standing on it, it is carried toward the mouth', () => {
    const { game } = beltGame();
    const walking = Object.assign(spawnEnemy(game, 'juggernaut', MOUTH - 60), {
      state: 'walk',
      vx: -0.45,
    });
    const standing = Object.assign(spawnEnemy(game, 'juggernaut', MOUTH - 90), { state: 'idle' });

    run(game, 10);

    expect(walking.x).toBe(MOUTH - 60);
    expect(standing.x).toBeCloseTo(MOUTH - 90 + 10 * CONVEYOR.speed);
  });

  it('knocked out already just burns, for no more score', () => {
    const { game } = beltGame();
    const raider = Object.assign(spawnEnemy(game, 'grunt', MOUTH), { state: 'ko' });
    const score = game.score;

    run(game, 1);

    expect(raider.removed).toBe(true);
    expect(game.score).toBe(score);
  });

  it('spills its purse on the belt short of the mouth, rolling back up it', () => {
    const { game } = beltGame();
    lying(spawnEnemy(game, 'grunt', MOUTH));

    run(game, 1);

    expect(game.loot.length).toBeGreaterThan(0);
    for (const coin of game.loot) {
      expect(coin.x).toBe(MOUTH - CONVEYOR.lip);
      expect(coin.vx).toBeLessThanOrEqual(0);
    }
  });
});

describe('the hero on the belt', () => {
  it('carried into the mouth is scorched and thrown back up the belt', () => {
    const { game, sounds } = beltGame();
    game.player.x = MOUTH - 1;
    const hp = game.player.hp;

    run(game, 2);

    expect(game.player.hp).toBe(hp - FURNACE_SCORCH.damage);
    expect(game.player).toMatchObject({ state: 'juggle', airborne: true });
    expect(game.player.vx).toBeLessThan(0);
    expect(soundKeys(sounds)).toContain('flame');
    expect(game.summons.some((summon) => summon.sprite === 'flare')).toBe(true);
  });

  it('is thrown out unhurt when the scorch would knock him out', () => {
    const { game } = beltGame();
    Object.assign(game.player, { x: MOUTH - 0.2, hp: 4 });

    run(game, 1);

    expect(game.player).toMatchObject({ hp: 4, state: 'juggle' });
  });

  it('is held at the lip while he cannot be hit, and scorched once he can', () => {
    const { game } = beltGame();
    Object.assign(game.player, { x: MOUTH - 0.2, invincible: 3 });

    run(game, 1);
    expect(game.player.x).toBeLessThan(MOUTH);
    game.player.invincible = 0;
    run(game, 2);

    expect(game.player.state).toBe('juggle');
  });

  it('running up the belt is still slowed by it', () => {
    const { game } = beltGame();
    Object.assign(game.player, { x: START + 60, state: 'run', vx: -2.5 });

    run(game, 10);

    expect(game.player.x).toBeCloseTo(START + 60 + 10 * CONVEYOR.speed);
  });

  it('striding off the end of the belt himself walks past the mouth', () => {
    const { game } = beltGame();
    Object.assign(game.player, { x: MOUTH - 0.2, state: 'run', vx: 2.5 });
    const hp = game.player.hp;

    run(game, 1);

    expect(game.player.hp).toBe(hp);
    expect(game.player.x).toBeGreaterThan(MOUTH);
  });
});
