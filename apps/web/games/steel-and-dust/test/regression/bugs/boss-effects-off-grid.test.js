import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { BOSS_KITS } from '../../../src/data/enemies/boss-kits/index.js';
import { createView } from '../../../src/render/create-view.js';
import { dimForBossUltimate, isBossUltimate } from '../../../src/render/fighters/boss-ultimate.js';
import { drawFighter } from '../../../src/render/fighters/draw-fighter.js';
import { drawEffects } from '../../../src/render/fx/effects.js';
import {
  drawGroundHazards,
  drawProjectiles,
  drawShockwaves,
} from '../../../src/render/fx/hazards.js';
import { drawParticles } from '../../../src/render/fx/particles.js';
import { drawBehindBursts, drawSummons } from '../../../src/render/fx/summons.js';
import { startMove } from '../../../src/sim/fighters/actions.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { floorBelow } from '../../../src/sim/stage/terrain.js';
import { FakeImage } from '../../support/fake-image.js';
import { createGridContext } from '../../support/grid-canvas.js';
import { RecordingCanvas } from '../../support/recording-canvas.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks } from '../../support/test-game.js';

// Bug: effects of the bosses drawn in code smeared off the screen's pixel grid. The Furnace
// Knight's flame lances were turned with rotate() and cut by a turned clip, and so were the Warden
// Ox's chain and flying hook; the bursts grown with a boss (a glint, a howl, a parry, the axe
// whirl), a boulder at its size and the Cobra's spreading puddle were drawn at sizes that left their
// edges between screen pixels, and so were a boss's own copies (the Gnoll's afterimages, the
// Pharaoh's mirages, the red wash of a wind-up, the Bayon Guardian's rim); a wind-up's danger zone
// ran out to a fraction of a pixel. Every boss plays each move of its kit here and all it leaves is
// drawn every tick on a context that keeps the transform and notes every draw off the grid
const originalRandom = Math.random;
const MISSION_OF = {
  khan: 0,
  colossus: 1,
  ironhorn: 2,
  cobra: 3,
  queen: 4,
  gnoll: 5,
  djinn: 6,
  furnace: 7,
  pharaoh: 8,
  brute: 9,
  naga: 10,
  guardian: 11,
};
const PLAY_TICKS = 260;
// off the screen-pixel grid on purpose, as fighters and the effects they leave mostly are
const HERO_X = 100.25;
const GAP = 140.7;

function movesOf(kit) {
  const swaps = Object.values(kit.phaseTwo?.swaps ?? {});
  const opener = kit.phaseTwo?.opener ? [kit.phaseTwo.opener] : [];
  const skills = kit.skills.map((skill) => skill.move);
  return [...new Set([...kit.close.moves, ...skills, ...swaps, kit.ultimate.move, ...opener])];
}

function bossArena(kind) {
  const game = createPlayingGame();
  game.missionIndex = MISSION_OF[kind];
  game.arena = { left: 0, right: 384 };
  game.player.x = HERO_X;
  spawnEnemy(game, kind, 1);
  const boss = game.boss;
  Object.assign(boss, { entering: false, x: HERO_X + GAP, facing: -1 });
  boss.ai.cooldown = 9999;
  return { game, boss };
}

function createCanvas(width, height) {
  return Object.assign(new RecordingCanvas(), { width, height });
}

// the layers a boss and what it leaves are drawn on, in the order drawWorld draws them
function drawBossLayers(view, { game, boss }) {
  const painter = view.painter;
  const cameraX = Math.round(game.camera.x);
  painter.context.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, -cameraX * RENDER_SCALE, 0);
  drawGroundHazards(painter, game.projectiles, view.fxSheets);
  drawBehindBursts(painter, game.summons, view.fxSheets);
  if (isBossUltimate(boss)) {
    dimForBossUltimate(painter, boss, cameraX);
  }
  drawFighter(painter, {
    fighter: boss,
    sheet: { ready: false },
    enemySheets: view.enemySheets,
    tickCount: game.tickCount,
    floor: floorBelow(game.terrain, boss.x, boss.y),
  });
  drawSummons(painter, game.summons, view.fxSheets);
  drawShockwaves(painter, game.shockwaves);
  drawProjectiles(painter, game.projectiles, view.fxSheets);
  drawParticles(painter, game.particles);
  drawEffects(painter, game.effects);
}

function playEveryMove(kind) {
  const { context, misses, counts } = createGridContext();
  const view = createView({
    context,
    createCanvas,
    createImage: () => new FakeImage(),
    baseUrl: '',
  });
  const found = new Set();
  for (const move of movesOf(BOSS_KITS[kind])) {
    const arena = bossArena(kind);
    startMove(arena.game, arena.boss, move);
    for (let i = 0; i < PLAY_TICKS; i++) {
      runTicks(arena.game, 1);
      arena.boss.ai.cooldown = 9999;
      arena.game.player.hp = arena.game.player.maxHp;
      drawBossLayers(view, arena);
      misses.splice(0).forEach((call) => found.add(`${move}: ${call}`));
    }
  }
  return { misses: [...found], draws: counts.draws };
}

describe('the grid context', () => {
  it('notes a fill between pixels, a turned image, a path and a gradient', () => {
    const { context, misses } = createGridContext();
    context.setTransform(2, 0, 0, 2, 0, 0);
    context.fillRect(1, 1, 2.5, 1);
    context.fillRect(1.25, 1, 2, 1);
    context.rotate(0.3);
    context.drawImage({ width: 4, height: 4 }, 0, 0);
    context.arc(0, 0, 4, 0, 1);
    context.createRadialGradient(0, 0, 1, 0, 0, 4);
    expect(misses).toHaveLength(5);
  });

  it('lets through whole pixels, mirrored or turned a quarter', () => {
    const { context, misses } = createGridContext();
    context.setTransform(2, 0, 0, 2, 1, 0);
    context.fillRect(1.5, 0.5, 2, 1);
    context.scale(-1, 1);
    context.transform(0, 1, -1, 0, 0, 0);
    context.drawImage({ width: 3, height: 5 }, 0.5, 1, 1.5, 2.5);
    expect(misses).toEqual([]);
  });
});

describe('every boss effect', () => {
  beforeEach(() => {
    Math.random = seededRandom(31);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it.each(Object.keys(BOSS_KITS))('of the %s lands on the screen-pixel grid', (kind) => {
    const { misses, draws } = playEveryMove(kind);
    expect(draws).toBeGreaterThan(1000);
    expect(misses).toEqual([]);
  });
});
