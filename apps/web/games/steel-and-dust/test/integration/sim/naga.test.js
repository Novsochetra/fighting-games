import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hurtBox, overlaps } from '../../../src/sim/combat/boxes.js';
import { jump, startMove } from '../../../src/sim/fighters/actions.js';
import { SHOT_RULES } from '../../../src/sim/hazards/shot-rules.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;
const JUMP = { vy: -5.8, vx: 0 };

function moatArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 10;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'naga', 1);
  const naga = game.boss;
  Object.assign(naga, { entering: false, x: game.player.x + gap, facing: -1 });
  naga.hp = hp ?? naga.maxHp;
  naga.ai.cooldown = 9999;
  return { game, naga };
}

// plays her move out with nothing else to think about
function playOut(game, naga, ticks, everyTick = () => {}) {
  for (let i = 0; i < ticks; i++) {
    everyTick(i);
    runTicks(game, 1);
    naga.ai.cooldown = 9999;
    game.player.x = Math.max(game.player.x, 20);
  }
}

const shotsOf = (game, kind) => game.projectiles.filter((shot) => shot.kind === kind);
const armed = (shot) => SHOT_RULES[shot.kind].armed?.(shot) ?? true;

// the hero jumps whatever armed danger of these kinds comes within `reach` of him on the ground
function jumpWhenClose(game, kinds, reach, onlyLow = () => true) {
  const player = game.player;
  const close = game.projectiles.some(
    (shot) =>
      kinds.includes(shot.kind) &&
      armed(shot) &&
      onlyLow(shot) &&
      Math.abs(shot.x - player.x) < reach &&
      Math.sign(player.x - shot.x) === shot.direction,
  );
  if (close && !player.airborne && player.state !== 'hurt') {
    jump(game, player, JUMP);
  }
}

describe('the Naga Raja in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('rolls a tide from her coil as it crashes: a hero who stands is knocked down, one who jumps clears it', () => {
    const standing = moatArena();
    startMove(standing.game, standing.naga, 'tidalCoil');
    playOut(standing.game, standing.naga, 41);
    const [tide] = shotsOf(standing.game, 'tide');
    expect(tide.x).toBeLessThan(standing.naga.x - 10);
    let downed = false;
    playOut(standing.game, standing.naga, 100, () => {
      downed ||= standing.game.player.state === 'down' || standing.game.player.airborne;
    });
    expect(downed).toBe(true);

    const jumping = moatArena();
    const hp = jumping.game.player.hp;
    startMove(jumping.game, jumping.naga, 'tidalCoil');
    playOut(jumping.game, jumping.naga, 140, () => jumpWhenClose(jumping.game, ['tide'], 44));
    expect(jumping.game.player.hp).toBe(hp);
  });

  it('flies her high water nagas over a standing hero and her low ones at his shins', () => {
    const { game, naga } = moatArena();
    game.player.invincible = 9999;
    startMove(game, naga, 'sevenHeads');
    const met = { low: false, high: false };
    playOut(game, naga, 300, () => {
      for (const bolt of shotsOf(game, 'nagaBolt').filter(armed)) {
        const lane = bolt.height > 20 ? 'high' : 'low';
        const box = SHOT_RULES.nagaBolt.area(bolt);
        met[lane] ||= bolt.y === bolt.laneY && overlaps(box, hurtBox(game.player));
      }
    });
    expect(met).toEqual({ low: true, high: false });
  });

  it('leaves a hero time to land from a jump over a low pair before the high pair comes', () => {
    const { game, naga } = moatArena();
    const hp = game.player.hp;
    startMove(game, naga, 'sevenHeads');
    const isLow = (bolt) => bolt.height < 20;
    playOut(game, naga, 300, () => jumpWhenClose(game, ['nagaBolt'], 34, isLow));
    expect(game.player.hp).toBe(hp);
  });

  it('sweeps a spirit naga from each side, then bursts a serpent up on the spot marked under the hero', () => {
    const { game, naga } = moatArena({ hp: 100 });
    game.player.invincible = 9999;
    startMove(game, naga, 'rainbowNaga');
    playOut(game, naga, 71);
    const [near] = shotsOf(game, 'spiritNaga');
    expect(near.direction).toBe(naga.facing);
    playOut(game, naga, 100);
    const far = shotsOf(game, 'spiritNaga').find((spirit) => spirit !== near);
    expect(far.direction).toBe(-naga.facing);
    playOut(game, naga, 100);
    const [rise] = shotsOf(game, 'serpentRise');
    expect(rise.x).toBe(game.player.x);
    playOut(game, naga, 140);
    expect(naga.move?.id).toBe('nagaSpent');
  });

  it('can be lived through: jump each spirit and walk off the marked spot', () => {
    const { game, naga } = moatArena({ hp: 100 });
    const hp = game.player.hp;
    startMove(game, naga, 'rainbowNaga');
    playOut(game, naga, 400, () => {
      jumpWhenClose(game, ['spiritNaga'], 60);
      const [rise] = shotsOf(game, 'serpentRise');
      if (rise && rise.time === 10) {
        game.player.x = rise.x - 60;
      }
    });
    expect(game.player.hp).toBe(hp);
  });
});
