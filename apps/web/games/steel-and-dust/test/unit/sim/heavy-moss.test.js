import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MOSS_HEAVY_ART } from '../../../src/art/heavy-fx/moss.js';
import { ULT_MAX } from '../../../src/config.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { MOSS_HEAVY_RENDER } from '../../../src/render/fx/heavy/moss.js';
import { MOSS_HEAVY_KIT } from '../../../src/sim/fx/heavy/moss.js';
import { mossSwingOf } from '../../../src/sim/fx/heavy/moss-swing.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { floorBelow } from '../../../src/sim/stage/terrain.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;
const FISTS = WEAPONS.fists.moves;
const ART_COLORS = new Set(Object.values(MOSS_HEAVY_ART).flat());
const isMoss = (particle) => particle.kind.startsWith('moss');

function mossGame() {
  const game = createPlayingGame({ settings: { hero: 'moss' }, io: { sfx: () => {} } });
  runTicks(game, 30);
  spawnEnemy(game, 'grunt', 1);
  const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
  Object.assign(raider, { entering: false, x: game.player.x + 22, hp: 900 });
  raider.ai.cooldown = 9999;
  game.player.facing = 1;
  game.ultMeter = ULT_MAX;
  return { game, raider };
}

// a painter that notes where it would paint, and in what color, instead of painting
function recordingPainter() {
  const marks = [];
  const painter = {
    context: {},
    color: null,
    use(color) {
      painter.color = color;
      return painter;
    },
    alpha: () => painter,
    rect(x, y) {
      marks.push({ x, y, color: painter.color });
      return painter;
    },
    line(from, to) {
      for (let step = 0; step <= 8; step++) {
        const share = step / 8;
        const x = from.x + (to.x - from.x) * share;
        marks.push({ x, y: from.y + (to.y - from.y) * share, color: painter.color });
      }
      return painter;
    },
  };
  return { painter, marks };
}

describe("the Moss Shade's heavy", () => {
  beforeEach(() => {
    Math.random = seededRandom(11);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('dresses a whole K K K chain in its own kinds and keeps to its share of particles', () => {
    const { game } = mossGame();
    const seen = new Set();
    let most = 0;
    for (const wait of [22, 30, 70]) {
      tap(game, 'heavy');
      for (let i = 0; i < wait; i++) {
        runTicks(game, 1);
        const own = game.particles.filter(isMoss);
        own.forEach((particle) => seen.add(particle.kind));
        most = Math.max(most, own.length);
      }
    }
    expect([...seen].sort()).toEqual(['mossBramble', 'mossLeaf', 'mossSpore', 'mossThorn']);
    expect(most).toBeLessThanOrEqual(56);
  });

  it('names the arc each heavy follows, whatever the weapon', () => {
    const arcs = ['K1', 'K2', 'K3', 'UK', 'LLK', 'AK', 'ADK', 'C1', 'C2'].map((id) =>
      mossSwingOf(FISTS[id]),
    );
    expect(arcs).toEqual([
      'sweep',
      'spin',
      'thrust',
      'rise',
      'rise',
      'fall',
      'dive',
      'thrust',
      'spin',
    ]);
    expect(mossSwingOf(WEAPONS.sword.moves.K2)).toBe('spin');
    expect(mossSwingOf(WEAPONS.sword.moves.K3)).toBe('sweep');
  });

  it('raises brambles under a target on the ground, never under one in the air', () => {
    const { game, raider } = mossGame();
    const hit = {
      attacker: game.player,
      target: raider,
      move: FISTS.K1,
      x: raider.x,
      y: raider.y - 20,
    };
    MOSS_HEAVY_KIT.impact(game, hit);
    const brambles = game.particles.filter((particle) => particle.kind === 'mossBramble');
    expect(brambles).toHaveLength(3);
    brambles.forEach((bramble) =>
      expect(bramble.y).toBe(floorBelow(game.terrain, raider.x, raider.y)),
    );
    game.particles.length = 0;
    raider.y -= 40;
    MOSS_HEAVY_KIT.impact(game, hit);
    MOSS_HEAVY_KIT.impact(game, { ...hit, move: FISTS.K2 });
    expect(game.particles.some((particle) => particle.kind === 'mossBramble')).toBe(false);
  });

  it('moves and draws every kind of its own, only in its own colors', () => {
    const { game, raider } = mossGame();
    const { player } = game;
    const move = FISTS.K1;
    MOSS_HEAVY_KIT.windup(game, player, move);
    MOSS_HEAVY_KIT.gather(game, player, move, 0);
    MOSS_HEAVY_KIT.release(game, player, move);
    MOSS_HEAVY_KIT.impact(game, {
      attacker: player,
      target: raider,
      move,
      x: raider.x,
      y: raider.y - 20,
    });
    const own = game.particles.filter(isMoss);
    const { painter, marks } = recordingPainter();
    for (let tick = 0; tick < 12; tick++) {
      for (const particle of own) {
        MOSS_HEAVY_KIT.particles[particle.kind](particle, game.terrain);
        MOSS_HEAVY_RENDER.particles[particle.kind](painter, particle);
      }
    }
    own.forEach((particle) =>
      expect(Number.isFinite(particle.x + particle.y), particle.kind).toBe(true),
    );
    expect(marks.length).toBeGreaterThan(0);
    marks.forEach((mark) => expect(ART_COLORS.has(mark.color), mark.color).toBe(true));
  });

  // the layer over the hero must never hide its face, in any heavy, on the ground or in the air
  it.each([1, -1])('draws over the hero clear of its face, facing %i', (facing) => {
    const fighter = { x: 100, y: 150, facing, airborne: false, trail: [] };
    const { painter, marks } = recordingPainter();
    for (const id of ['K1', 'K2', 'K3', 'UK', 'AK', 'ADK']) {
      const move = FISTS[id];
      for (const airborne of [false, true]) {
        for (let time = 0; time < move.startup + 12; time++) {
          const layer = {
            fighter: { ...fighter, airborne },
            move,
            time,
            art: MOSS_HEAVY_ART,
            tickCount: time,
          };
          MOSS_HEAVY_RENDER.over(painter, layer);
        }
      }
    }
    const onFace = marks.filter((mark) => {
      const ahead = (mark.x - fighter.x) * facing;
      const up = mark.y - fighter.y;
      return ahead >= 0 && ahead <= 6 && up >= -26 && up <= -20;
    });
    expect(marks.length).toBeGreaterThan(0);
    expect(onFace).toEqual([]);
  });
});
