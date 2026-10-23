import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hurtBox } from '../../../src/sim/combat/boxes.js';
import { jump, startMove } from '../../../src/sim/fighters/actions.js';
import { FACE_TIMES } from '../../../src/sim/hazards/stone-faces.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function bayonArena({ gap = 170 } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 11;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'guardian', 1);
  const guardian = game.boss;
  Object.assign(guardian, { entering: false, x: game.player.x + gap, facing: -1 });
  guardian.ai.cooldown = 9999;
  return { game, guardian };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, guardian, ticks, everyTick = () => {}) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    guardian.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);
const hurt = (states) => ['hurt', 'juggle', 'down'].some((state) => states.has(state));

describe('the Bayon Guardian in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(12);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('marks the ground under the hero and bursts a gold pillar there that turns them to stone', () => {
    const { game, guardian } = bayonArena();
    startMove(game, guardian, 'stoneGaze');
    playOut(game, guardian, 10);
    const [pillar] = shotsOf(game, 'gazePillar');
    expect(pillar.x).toBe(game.player.x);
    expect(pillar.time).toBeLessThan(0);
    const states = playOut(game, guardian, 40);
    expect(hurt(states)).toBe(true);
    expect(game.player.stoned).toBe(true);
  });

  it('lets a hero who walks off the mark go untouched', () => {
    const { game, guardian } = bayonArena();
    startMove(game, guardian, 'stoneGaze');
    playOut(game, guardian, 10);
    game.player.x -= 40;
    const states = playOut(game, guardian, 40);
    expect(hurt(states)).toBe(false);
    expect(game.player.stoned).toBeFalsy();
  });

  it('glaring, raises three pillars with room to stand between them', () => {
    const { game, guardian } = bayonArena();
    startMove(game, guardian, 'stoneGlare');
    playOut(game, guardian, 10);
    const spots = shotsOf(game, 'gazePillar').map((pillar) => pillar.x);
    expect(spots).toHaveLength(3);
    game.player.x = (spots[0] + spots[1]) / 2;
    expect(hurt(playOut(game, guardian, 40))).toBe(false);
  });

  it('drives fig roots along the floor at the hero, then up under where they stood', () => {
    const { game, guardian } = bayonArena({ gap: 160 });
    startMove(game, guardian, 'figRoots');
    playOut(game, guardian, guardian.move.startup + 1);
    const roots = shotsOf(game, 'figRoot');
    expect(roots.filter((root) => !root.marked)).toHaveLength(5);
    expect(roots.find((root) => root.marked).x).toBe(game.player.x);
    expect(hurt(playOut(game, guardian, 70))).toBe(true);
  });

  it('raises four faces at the screen edges in turn, left and right', () => {
    const { game, guardian } = bayonArena();
    game.player.invincible = 9999;
    startMove(game, guardian, 'fourFaces');
    const faces = new Set();
    playOut(game, guardian, 330, () => {
      shotsOf(game, 'stoneFace').forEach((face) => faces.add(face));
    });
    const sides = [...faces].map((face) => (face.x < 192 ? 'left' : 'right'));
    expect(sides).toEqual(['left', 'right', 'left', 'right']);
  });

  it('burns a hero standing in a beam, not one who jumps it or stands past its reach', () => {
    const stood = bayonArena();
    startMove(stood.game, stood.guardian, 'fourFaces');
    expect(hurt(playOut(stood.game, stood.guardian, 60 + FACE_TIMES.sink))).toBe(true);

    const jumped = bayonArena();
    startMove(jumped.game, jumped.guardian, 'fourFaces');
    const jumpAt = 60 + FACE_TIMES.fire - 6;
    const states = playOut(jumped.game, jumped.guardian, 60 + FACE_TIMES.sink, (tick) => {
      if (tick === jumpAt) {
        jump(jumped.game, jumped.game.player, { vy: -5.8, vx: 0 });
      }
    });
    expect(hurt(states)).toBe(false);

    const far = bayonArena({ gap: 40 });
    far.game.player.x = 340;
    far.guardian.x = 200;
    startMove(far.game, far.guardian, 'fourFaces');
    expect(hurt(playOut(far.game, far.guardian, 60 + FACE_TIMES.sink))).toBe(false);
  });

  it('falls to rubble out of reach at half health, and reforms glowing', () => {
    const { game, guardian } = bayonArena();
    game.player.invincible = 9999;
    startMove(game, guardian, 'crumble');
    playOut(game, guardian, 50);
    expect(hurtBox(guardian)).toBeNull();
    expect(guardian.glowing).toBeFalsy();
    playOut(game, guardian, 60);
    expect(hurtBox(guardian)).not.toBeNull();
    expect(guardian.glowing).toBe(true);
  });
});
