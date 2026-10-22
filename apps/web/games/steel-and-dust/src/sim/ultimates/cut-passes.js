import { FX_COLORS } from '../../art/fx-colors.js';
import { THOUSAND_CUTS } from '../../data/ultimates/thousand-cuts.js';
import { clamp, randomBetween } from '../../lib/math.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { themeOf } from '../fighters/hero-colors.js';
import { addCutLine } from '../fx/effects.js';
import { groundAt } from '../stage/terrain.js';
import { leaveCarving } from '../summons/carvings.js';
import { hangCut } from '../summons/hanging-cuts.js';
import { strikeTarget } from '../summons/strike.js';
import { ultTargets } from './common.js';
import { passAt, passFrame, PASSES, SWORD_ROW } from './cut-timing.js';

const { beyond, crossTicks, cut: CUT } = THOUSAND_CUTS;
// with no raider on screen he cuts through the air, this far either side of where he stood
const SHADOW_REACH = 90;
// the line each strip's blade draws across a body, in radians from level
const CUT_ANGLES = {
  slash1: 0.7,
  slash2: -0.8,
  spin_slash: 0.1,
  thrust: 0,
  rising_dragon: -1.3,
  air_slash: 0.9,
  cleave: 1.4,
};

function liveTargets(player) {
  return player.cuts.targets.filter((target) => target.state !== 'ko' && !target.removed);
}

// the raiders he cuts through, nearest first, fixed as the passes start so the camera following him
// cannot change who is next
export function startPasses(game, player) {
  const targets = ultTargets(game).sort(
    (first, second) => Math.abs(first.x - player.x) - Math.abs(second.x - player.x),
  );
  player.cuts = { targets, made: new Map(), fromX: player.x };
}

// through the raider and out past it, or past it to the near side when a screen edge is behind it
function passEnd(game, player, target) {
  const bounds = arenaBounds(game, player);
  if (!target) {
    const side = player.x > player.cuts.fromX ? -1 : 1;
    return clamp(player.cuts.fromX + side * SHADOW_REACH, bounds.min, bounds.max);
  }
  const way = target.x >= player.x ? 1 : -1;
  const through = clamp(target.x + way * beyond, bounds.min, bounds.max);
  if (Math.abs(through - target.x) >= beyond / 2) {
    return through;
  }
  return clamp(target.x - way * beyond, bounds.min, bounds.max);
}

function startPass(game, player, index) {
  const alive = liveTargets(player);
  const target = alive.length ? alive[index % alive.length] : null;
  const toX = passEnd(game, player, target);
  player.cuts.pass = { target, fromX: player.x, toX };
  player.facing = toX >= player.x ? 1 : -1;
}

function sandstoneImage(player) {
  player.afterimages.push({
    x: player.x,
    y: player.y,
    facing: player.facing,
    sprite: player.ultFrame,
    row: SWORD_ROW,
    color: FX_COLORS.reliefStone,
    life: 10,
  });
}

function cross(game, player, since) {
  const { fromX, toX } = player.cuts.pass;
  player.x = fromX + (toX - fromX) * Math.min(1, (since + 1) / crossTicks);
  player.y = groundAt(game.terrain, player.x);
  sandstoneImage(player);
}

// the cut lands lightly in passing, with the dav whatever he holds, staggering the raider where it
// stands, and a cut of gold is left hanging on it, each a little apart from the last on the same raider
function cutThrough(game, player, index) {
  const { target } = player.cuts.pass;
  const [strip] = PASSES[index].sprite;
  const angle = CUT_ANGLES[strip] ?? 0;
  game.io.sfx('swingSword', true, { x: player.x });
  if (!target) {
    return;
  }
  const count = player.cuts.made.get(target) ?? 0;
  player.cuts.made.set(target, count + 1);
  const y = target.y - 18 * target.scale;
  strikeTarget(
    game,
    { x: player.x, direction: player.facing, side: 'player' },
    { target, move: CUT },
  );
  const color = themeOf(game).blade;
  addCutLine(game, { x: target.x, y, angle, color });
  const offset = [randomBetween(-4, 4), (count % 3) * 6 - 6];
  hangCut(game, { target, angle, color, offset });
}

// each pass: he winds up, crosses through his raider in a blur of sandstone images and holds the
// follow-through; where he stood before it, his shape is left carved in the stone
export function runPass(game, player, time) {
  const index = passAt(time);
  const pass = PASSES[index];
  player.ultFrame = passFrame(time);
  if (time === pass.start) {
    if (index > 0) {
      const sprite = [...PASSES[index - 1].sprite, SWORD_ROW];
      leaveCarving(game, { x: player.x, y: player.y, facing: player.facing, sprite });
    }
    startPass(game, player, index);
  }
  if (time >= pass.crossAt && time < pass.crossAt + crossTicks) {
    cross(game, player, time - pass.crossAt);
  }
  if (time === pass.cutAt) {
    cutThrough(game, player, index);
  }
}
