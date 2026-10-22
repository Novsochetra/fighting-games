import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function colossusArena({ gap = 140, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 1;
  game.arena = { left: 0, right: 400 };
  game.player.x = 120;
  spawnEnemy(game, 'colossus', 1);
  const colossus = game.boss;
  Object.assign(colossus, { entering: false, x: game.player.x + gap, facing: -1 });
  colossus.hp = hp ?? colossus.maxHp;
  return { game, colossus };
}

// runs the move out, gathering every shot it makes, while the hero stands and cannot fall
function playOut(game, ticks) {
  const shots = new Set();
  let knockedDown = false;
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    game.player.hp = game.player.maxHp;
    game.projectiles.forEach((shot) => shots.add(shot));
    knockedDown ||= game.player.state === 'juggle' || game.player.state === 'down';
  }
  const ofKind = (kind) => [...shots].filter((shot) => shot.kind === kind);
  return { ofKind, knockedDown };
}

describe('the Rust Colossus in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(8);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('lobs a boulder onto the hero, which shatters into shards that skid both ways', () => {
    const { game, colossus } = colossusArena();
    startMove(game, colossus, 'boulderLob');
    const { ofKind, knockedDown } = playOut(game, 150);
    expect(ofKind('boulder')).toHaveLength(1);
    expect(
      ofKind('shard')
        .map((shard) => shard.direction)
        .sort(),
    ).toEqual([-1, 1]);
    expect(knockedDown).toBe(true);
  });

  it('raises a line of six spikes toward the hero, which throws a hero in it', () => {
    const { game, colossus } = colossusArena({ gap: 90 });
    startMove(game, colossus, 'spikeLine');
    const { ofKind, knockedDown } = playOut(game, 120);
    const spikes = ofKind('spike');
    expect(spikes).toHaveLength(6);
    expect(spikes.every((spike) => spike.x < colossus.x)).toBe(true);
    expect(knockedDown).toBe(true);
  });

  it('raises spikes both ways below half health', () => {
    const { game, colossus } = colossusArena({ gap: 90 });
    startMove(game, colossus, 'spikeCross');
    const spikes = playOut(game, 60).ofKind('spike');
    expect(spikes.filter((spike) => spike.x < colossus.x)).toHaveLength(6);
    expect(spikes.filter((spike) => spike.x > colossus.x).length).toBeGreaterThan(0);
  });

  it('pounds out two shockwaves with the Landslide, then drops nine boulders, some on the hero', () => {
    const { game, colossus } = colossusArena({ hp: 80 });
    startMove(game, colossus, 'landslide');
    let waves = 0;
    const shots = new Set();
    for (let i = 0; i < 320; i++) {
      const before = game.shockwaves.length;
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      waves += Math.max(0, game.shockwaves.length - before);
      game.projectiles.forEach((shot) => shots.add(shot));
    }
    const boulders = [...shots].filter((shot) => shot.kind === 'boulder');
    expect(waves).toBe(4);
    expect(boulders).toHaveLength(9);
    expect(colossus.state).not.toBe('hurt');
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of his kit, and never steps back', () => {
    const { game, colossus } = colossusArena({ hp: 90 });
    const used = new Set();
    for (let i = 0; i < 3600; i++) {
      if (i % 400 === 0) {
        game.player.x = colossus.x > 200 ? 20 : 380;
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      colossus.hp = Math.max(colossus.hp, 40);
      used.add(colossus.move?.id);
      if (colossus.state === 'walk') {
        expect(colossus.walkDirection).toBe(1);
      }
    }
    expect([...used]).toEqual(expect.arrayContaining(['spikeCross', 'boulderLob', 'landslide']));
  });
});
