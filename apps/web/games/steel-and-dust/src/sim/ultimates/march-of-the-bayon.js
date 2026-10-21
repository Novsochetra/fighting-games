import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { MARCH_OF_THE_BAYON } from '../../data/ultimates/march-of-the-bayon.js';
import { themeOf } from '../fighters/hero-colors.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { raiseSoldier, SOLDIER_TIMING } from '../summons/soldiers.js';
import { finaleFlash, finishUlt, hitEveryTarget } from './common.js';

const { poseTicks, ranks, spacing, edge, leapAt, chopAt, end } = MARCH_OF_THE_BAYON;
const BLAZE_FRAMES = [2, 3, 4];
const BLAZE_TICKS = 6;
const CHOP_TICKS = 6;
const SPLIT_STEP = 32;

// his ultimate strip: raising the dav (0-1), its blade blazing (2-4) while the ranks march, the leap
// (5-6), the chop (7), then kneeling over the split ground (8) until it ends
export function marchFrame(time) {
  if (time < poseTicks * 2) {
    return ['ult', Math.floor(time / poseTicks)];
  }
  if (time < leapAt) {
    return ['ult', BLAZE_FRAMES[Math.floor(time / BLAZE_TICKS) % BLAZE_FRAMES.length]];
  }
  if (time < chopAt) {
    return ['ult', time < (leapAt + chopAt) / 2 ? 5 : 6];
  }
  return ['ult', time < chopAt + CHOP_TICKS ? 7 : 8];
}

// a whole rank steps out of the stone at once, across the screen, and thrusts in step
function raiseRank(game, player, rank) {
  const direction = player.facing * rank.facing;
  const left = game.camera.x + edge;
  for (let x = left; x <= left + VIEW_WIDTH - edge * 2; x += spacing) {
    raiseSoldier(game, { x, direction });
  }
  game.io.sfx('relief', false, { x: player.x });
}

function rankThrusts(game, player) {
  hitEveryTarget(game, player, MARCH_OF_THE_BAYON.rank);
  shake(game, 3, 10);
}

// the chop splits the ground from one edge to the other: stone dust and gold sparks all along it
function splitGround(game, player) {
  hitEveryTarget(game, player, MARCH_OF_THE_BAYON.split);
  const color = themeOf(game).spark;
  for (let x = game.camera.x + edge; x < game.camera.x + VIEW_WIDTH; x += SPLIT_STEP) {
    const y = groundAt(game.terrain, x);
    addDust(game, { x, y, count: 3, color: FX_COLORS.reliefStone });
    addSparks(game, { x, y: y - 4, count: 4, color, speed: 3.6 });
  }
  game.io.sfx('boom');
  finaleFlash(game);
}

export function runMarchOfTheBayon(game, player, time) {
  player.ultFrame = marchFrame(time);
  for (const rank of ranks) {
    if (time === rank.at) {
      raiseRank(game, player, rank);
    }
    if (time === rank.at + SOLDIER_TIMING.strike) {
      rankThrusts(game, player);
    }
  }
  if (time === chopAt) {
    splitGround(game, player);
  }
  if (time >= end) {
    finishUlt(player);
  }
}
