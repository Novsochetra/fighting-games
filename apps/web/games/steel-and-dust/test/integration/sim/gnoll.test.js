import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

const originalRandom = Math.random;

function gnollArena({ gap = 150, hp } = {}) {
  const game = createPlayingGame();
  game.missionIndex = 5;
  game.arena = { left: 0, right: 384 };
  game.player.x = 120;
  spawnEnemy(game, 'gnoll', 1);
  const gnoll = game.boss;
  Object.assign(gnoll, { entering: false, x: game.player.x + gap, facing: -1 });
  gnoll.hp = hp ?? gnoll.maxHp;
  gnoll.ai.cooldown = 9999;
  return { game, gnoll };
}

// plays his move out with nothing else to think about, noting each state the hero passes through
function playOut(game, gnoll, ticks) {
  const states = new Set();
  for (let i = 0; i < ticks; i++) {
    runTicks(game, 1);
    gnoll.ai.cooldown = 9999;
    states.add(game.player.state);
  }
  return states;
}

describe('the Gnoll Packlord in a fight', () => {
  beforeEach(() => {
    Math.random = seededRandom(5);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('howls two hounds in from both sides of the screen', () => {
    const { game, gnoll } = gnollArena();
    game.player.invincible = 9999;
    startMove(game, gnoll, 'packCall');
    playOut(game, gnoll, 120);
    const hounds = game.fighters.filter((fighter) => fighter.kind === 'hound');
    expect(hounds).toHaveLength(2);
  });

  it('pounces onto the spot marked under the hero and knocks a hero who stayed off their feet', () => {
    const { game, gnoll } = gnollArena({ gap: 150 });
    startMove(game, gnoll, 'leapingMaul');
    playOut(game, gnoll, 19);
    const mark = game.projectiles.find((shot) => shot.kind === 'pounceMark');
    expect(mark.x).toBe(120);
    expect(gnoll.airborne).toBe(true);
    const states = new Set();
    while (gnoll.airborne) {
      playOut(game, gnoll, 1).forEach((state) => states.add(state));
    }
    expect(Math.abs(gnoll.x - mark.x)).toBeLessThan(4);
    playOut(game, gnoll, 20).forEach((state) => states.add(state));
    expect(states.has('juggle')).toBe(true);
  });

  it('lunges from wall to wall five times, feeding on every lunge that lands, then pants', () => {
    const { game, gnoll } = gnollArena({ hp: 80 });
    startMove(game, gnoll, 'bloodFrenzy');
    const moves = new Set();
    let fed = false;
    for (let i = 0; i < 700 && gnoll.move; i++) {
      playOut(game, gnoll, 1);
      game.player.hp = game.player.maxHp;
      moves.add(gnoll.move?.id);
      fed = fed || gnoll.hp > 80;
    }
    expect([...moves]).toEqual(
      expect.arrayContaining([
        'bloodFrenzy',
        'frenzy2',
        'frenzy3',
        'frenzy4',
        'frenzy5',
        'frenzyPant',
      ]),
    );
    expect(fed).toBe(true);
  });

  // the hero cannot fall and now and then backs off across the arena, as a player keeping away would
  it('fights a whole bout with every move of his kit', () => {
    const { game, gnoll } = gnollArena({ hp: 100 });
    gnoll.ai.cooldown = 0;
    const used = new Set();
    for (let i = 0; i < 4800; i++) {
      if (i % 600 === 0) {
        game.player.x = gnoll.x > 192 ? 20 : 364;
      }
      if (i % 900 === 0) {
        game.fighters = game.fighters.filter(
          (fighter) => fighter.side === 'player' || fighter.def.boss,
        );
      }
      runTicks(game, 1);
      game.player.hp = game.player.maxHp;
      gnoll.hp = Math.max(gnoll.hp, 40);
      used.add(gnoll.move?.id);
    }
    expect([...used]).toEqual(
      expect.arrayContaining(['leapingMaul', 'packCallThree', 'bloodFrenzy', 'frenzyPant']),
    );
  });
});
