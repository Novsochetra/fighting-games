import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANTLER_HEAVY_ART as ART } from '../../../src/art/heavy-fx/antler.js';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { ANTLER_HEAVY_SOUNDS } from '../../../src/audio/live/heavy/antler.js';
import { activeEnd, moveLength } from '../../../src/data/moves/define-move.js';
import { drawCrown } from '../../../src/render/fx/heavy/antler-crown.js';
import { ANTLER_HEAVY_RENDER as RENDER } from '../../../src/render/fx/heavy/antler.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { movesetOf } from '../../../src/sim/fighters/loadout.js';
import { ANTLER_HEAVY_KIT as KIT } from '../../../src/sim/fx/heavy/antler.js';
import { updateEffects } from '../../../src/sim/fx/update-effects.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';
import { createFakeAudioContext, nodesOfKind } from '../audio/fake-audio-context.js';
import { boundsOf, drawnRects, offGrid, recordingPainter } from '../render/fx/fx-recorder.js';

const SHARED_KINDS = ['spark', 'dust', 'chunk', 'mote', 'streak'];
const originalRandom = Math.random;

beforeEach(() => {
  Math.random = seededRandom(3);
});
afterEach(() => {
  Math.random = originalRandom;
});

// Math.random also steers the raiders and the recorded runs: dressing a heavy must never touch it
function withoutRandom(run) {
  const seeded = Math.random;
  Math.random = () => {
    throw new Error('the antler heavy used Math.random');
  };
  try {
    return run();
  } finally {
    Math.random = seeded;
  }
}

function antlerGame() {
  const game = createPlayingGame({ settings: { hero: 'antler' } });
  runTicks(game, 30);
  game.particles = [];
  game.player.facing = 1;
  return game;
}

const hitTimes = (move) =>
  move.multiHit
    ? Array.from(
        { length: Math.ceil(move.active / move.multiHit) },
        (_, i) => move.startup + i * move.multiHit,
      )
    : [move.startup];

// one tick of a heavy as the driver runs it (sim/fx/heavy-feel.js), a blow landing on each hit
function stepKit(game, move, time) {
  const fighter = game.player;
  if (time === 0) {
    KIT.windup(game, fighter, move);
  }
  if (time < move.startup) {
    KIT.gather(game, fighter, move, time);
  }
  if (time === move.startup) {
    KIT.release(game, fighter, move);
  }
  if (time >= move.startup && time < activeEnd(move)) {
    KIT.trail(game, fighter, move, time);
  }
  if (hitTimes(move).includes(time)) {
    KIT.impact(game, {
      attacker: fighter,
      target: fighter,
      move,
      x: fighter.x + 20,
      y: fighter.y - 22,
    });
  }
}

// plays moves back to back, each cut off where the next is chained, noting the most alive at once
function playChain(game, steps) {
  const seen = { most: 0, kinds: new Map() };
  for (const [id, ticks] of steps) {
    const move = movesetOf(game, game.player)[id];
    for (let time = 0; time < Math.min(ticks, moveLength(move)); time++) {
      withoutRandom(() => stepKit(game, move, time));
      game.particles.forEach((particle) => seen.kinds.set(particle.kind, { ...particle }));
      updateEffects(game);
      seen.most = Math.max(seen.most, game.particles.length);
    }
  }
  return seen;
}

function heroInHeavy(id, time, { airborne = false, facing = 1 } = {}) {
  const game = antlerGame();
  const fighter = game.player;
  startMove(game, fighter, id);
  Object.assign(fighter, { moveTime: time, airborne, facing, x: 100, y: 150 });
  return { fighter, move: fighter.move, time, tickCount: 40, art: ART };
}

function drawn(draw, layer) {
  const { painter, log } = recordingPainter();
  withoutRandom(() => draw(painter, layer));
  return drawnRects(log);
}

describe("the Antler Spirit Shade's heavy", () => {
  it('keeps a K K K chain on its fists within about 60 live particles', () => {
    const game = antlerGame();
    const { most } = playChain(game, [
      ['K1', 23],
      ['K2', 30],
      ['K3', 60],
    ]);
    expect(most).toBeGreaterThan(15);
    expect(most).toBeLessThanOrEqual(60);
  });

  it('keeps its air heavies, the long dive too, within budget', () => {
    const game = antlerGame();
    game.player.airborne = true;
    const { most } = playChain(game, [
      ['AK', 30],
      ['ADK', 70],
    ]);
    expect(most).toBeLessThanOrEqual(60);
  });

  it('only leaves particles it moves and draws, each on the screen-pixel grid', () => {
    const game = antlerGame();
    const { kinds } = playChain(game, [
      ['K1', 23],
      ['K2', 30],
      ['C2', 60],
    ]);
    for (const [kind, particle] of kinds) {
      if (SHARED_KINDS.includes(kind)) {
        continue;
      }
      expect(kind.startsWith('antler'), kind).toBe(true);
      expect(typeof KIT.particles[kind], kind).toBe('function');
      const rects = drawn(RENDER.particles[kind], particle);
      expect(rects.length, kind).toBeGreaterThan(0);
      expect(offGrid(rects), kind).toEqual([]);
    }
    expect([...kinds.keys()]).toEqual(
      expect.arrayContaining(['antlerWisp', 'antlerHoof', 'antlerFork', 'antlerRush']),
    );
  });

  it('sends its ghost fire up and its charge on, and leaves prints where they were branded', () => {
    const wisp = { x: 0, y: 0, vx: 0, vy: -0.7, life: 16, maxLife: 16, phase: 0 };
    const rush = { x: 0, y: 0, vx: 3.4, vy: 0, life: 7, maxLife: 7 };
    const hoof = { x: 5, y: 9, life: 28, maxLife: 28, seed: 3 };
    for (let i = 0; i < 6; i++) {
      KIT.particles.antlerWisp(wisp);
      KIT.particles.antlerRush(rush);
      KIT.particles.antlerHoof(hoof);
    }
    expect(wisp.y).toBeLessThan(-4);
    expect(rush.x).toBeGreaterThan(10);
    expect(hoof).toMatchObject({ x: 5, y: 9 });
  });
});

describe("the Antler Spirit Shade's spirit antlers", () => {
  const crown = (id, time, options) =>
    drawn((painter, layer) => drawCrown(painter.context, layer), heroInHeavy(id, time, options));

  it('grow tine by tine over the wind-up, ram as it strikes and are gone after', () => {
    const { startup } = heroInHeavy('K1', 0).move;
    expect(crown('K1', 1).length).toBeLessThan(crown('K1', startup - 3).length);
    expect(crown('K1', startup - 1).some((rect) => rect.color === ART.hot)).toBe(true);
    expect(crown('K1', startup + 1).length).toBeGreaterThan(0);
    expect(crown('K1', startup + 4)).toEqual([]);
  });

  it('ram down and on as a heavy strikes, but thrust straight up for a launcher', () => {
    const ram = heroInHeavy('K1', 0).move.startup;
    expect(boundsOf(crown('K1', ram + 1)).right).toBeGreaterThan(
      boundsOf(crown('K1', ram - 1)).right + 6,
    );
    const lift = heroInHeavy('UK', 0).move.startup;
    const thrust = boundsOf(crown('UK', lift + 1));
    expect(thrust.top).toBeLessThan(boundsOf(crown('UK', lift - 1)).top);
    expect(thrust.right).toBeLessThanOrEqual(100 + 8);
  });

  it('stand over its head and behind it, clear of its face and of the raider ahead', () => {
    const { startup } = heroInHeavy('K1', 0).move;
    const right = boundsOf(crown('K1', startup - 1));
    expect(right.bottom).toBeLessThanOrEqual(150 - 24);
    expect(right.top).toBeGreaterThanOrEqual(150 - 50);
    expect(right.right).toBeLessThanOrEqual(100 + 8);
    expect(right.left).toBeGreaterThanOrEqual(100 - 20);
    const left = boundsOf(crown('K1', startup - 1, { facing: -1 }));
    expect(left.left).toBeGreaterThanOrEqual(100 - 8 - 1);
    expect(left.right).toBeLessThanOrEqual(100 + 20 + 1);
  });

  it('pool ghost fire round its hooves only while it stands on the road', () => {
    const atFeet = (rects) => rects.filter((rect) => rect.y > 150 - 8);
    expect(atFeet(drawn(RENDER.under, heroInHeavy('K1', 4))).length).toBeGreaterThan(0);
    expect(atFeet(drawn(RENDER.under, heroInHeavy('AK', 4, { airborne: true })))).toEqual([]);
    expect(offGrid(drawn(RENDER.under, heroInHeavy('K1', 6)))).toEqual([]);
  });
});

describe("the Antler Spirit Shade's heavy sounds", () => {
  function play(key) {
    const context = createFakeAudioContext({ state: 'running' });
    const live = { context, chain: buildChain(context) };
    context.nodes.length = 0;
    ANTLER_HEAVY_SOUNDS[key](live, 2);
    return [...nodesOfKind(context, 'oscillator'), ...nodesOfKind(context, 'bufferSource')];
  }

  // the charge plays at the start of every heavy, and a chain of three is about a second long
  it('charges short enough to sit under a chain, and snorts shorter still as it strikes', () => {
    for (const node of play('heavyAntlerCharge')) {
      expect(node.stops[0][0]).toBeLessThanOrEqual(2 + 0.3);
    }
    for (const node of play('heavyAntlerRelease')) {
      expect(node.stops[0][0]).toBeLessThanOrEqual(2 + 0.15);
    }
  });
});
