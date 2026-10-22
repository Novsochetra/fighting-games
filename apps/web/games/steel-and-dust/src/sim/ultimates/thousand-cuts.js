import { VIEW_WIDTH } from '../../config.js';
import { THOUSAND_CUTS } from '../../data/ultimates/thousand-cuts.js';
import { randomBetween } from '../../lib/math.js';
import { themeOf } from '../fighters/hero-colors.js';
import { shake } from '../fx/camera-fx.js';
import { addScreenCut } from '../fx/effects.js';
import { swingCarving } from '../summons/carvings.js';
import { severCut } from '../summons/hanging-cuts.js';
import { splitGround } from './bayon-split.js';
import { finishUlt } from './common.js';
import { runPass, startPasses } from './cut-passes.js';
import { passFrame, PASSES_END } from './cut-timing.js';

const { poseTicks, passesAt, releaseAt, leapAt, leapHeight, chopAt, end } = THOUSAND_CUTS;
const BLAZE_FRAMES = [2, 3, 4];
const BLAZE_TICKS = 6;
const CHOP_TICKS = 6;
const MOTE_EVERY = 3;
const ECHO_EVERY = 2;
// the great slash crosses the field at chest height, rising a little to the right
const SCREEN_CUT_ANGLE = -0.18;
const SCREEN_CUT_HEIGHT = 30;

// his frames: raising the dav (0-1) and its blade blazing (2-4) through the cut-in, the passes in
// his own sword strips, the dav lowered while he waits, the leap (5-6), the chop (7), then kneeling
// over the split ground (8) until it ends
export function cutsFrame(time) {
  if (time < poseTicks * 2) {
    return ['ult', Math.floor(time / poseTicks)];
  }
  if (time < passesAt) {
    return ['ult', BLAZE_FRAMES[Math.floor(time / BLAZE_TICKS) % BLAZE_FRAMES.length]];
  }
  if (time < leapAt) {
    return passFrame(time);
  }
  if (time < chopAt) {
    return ['ult', time < (leapAt + chopAt) / 2 ? 5 : 6];
  }
  return ['ult', time < chopAt + CHOP_TICKS ? 7 : 8];
}

// how high the leap has carried him: an arc off the ground and back down onto the chop
export function leapLift(time) {
  if (time <= leapAt || time >= chopAt) {
    return 0;
  }
  const progress = (time - leapAt) / (chopAt - leapAt);
  return leapHeight * 4 * progress * (1 - progress);
}

// gold rises off him while the dav's blade blazes
function blaze(game, player) {
  const theme = themeOf(game);
  game.particles.push({
    kind: 'mote',
    x: player.x + randomBetween(-16, 16),
    y: player.y - randomBetween(0, 40),
    vx: 0,
    vy: -randomBetween(0.6, 1.3),
    life: 26,
    maxLife: 26,
    color: game.tickCount % 2 ? theme.blade : theme.spark,
  });
}

// every cut he left lands at once, one great slash across the field, and every carving swings with
// him
function release(game, player) {
  for (const summon of game.summons) {
    if (summon.kind === 'hangingCut') {
      severCut(game, summon, { from: player, move: THOUSAND_CUTS.sever });
    }
    if (summon.kind === 'carving') {
      swingCarving(summon);
    }
  }
  const x = game.camera.x + VIEW_WIDTH / 2;
  const color = themeOf(game).blade;
  addScreenCut(game, { x, y: player.y - SCREEN_CUT_HEIGHT, angle: SCREEN_CUT_ANGLE, color });
  game.flashTime = 6;
  shake(game, 4, 14);
  game.io.sfx('sever');
}

// he leaps off the spot he stood on, leaving gold echoes along the arc, and lands back on it
function leap(game, player, time) {
  if (time === leapAt) {
    player.leapFrom = player.y;
  }
  player.y = player.leapFrom - leapLift(time);
  if (time % ECHO_EVERY === 0 && time < chopAt) {
    player.afterimages.push({
      x: player.x,
      y: player.y,
      facing: player.facing,
      sprite: player.ultFrame,
      color: themeOf(game).blade,
      life: 10,
    });
  }
}

function runPasses(game, player, time) {
  if (time === passesAt) {
    startPasses(game, player);
  }
  if (time >= passesAt && time < PASSES_END) {
    runPass(game, player, time);
  }
  if (time === releaseAt) {
    release(game, player);
  }
}

// the Angkor Warrior: cut through the raiders again and again, leaving gold cuts hanging and his
// shape carved in stone; every cut lands at once, then he leaps and splits the ground
export function runThousandCuts(game, player, time) {
  player.ultFrame = cutsFrame(time);
  if (time >= poseTicks * 2 && time < passesAt && time % MOTE_EVERY === 0) {
    blaze(game, player);
  }
  runPasses(game, player, time);
  if (time >= leapAt && time <= chopAt) {
    leap(game, player, time);
  }
  if (time === chopAt) {
    splitGround(game, player);
  }
  if (time >= end) {
    player.cuts = null;
    finishUlt(player);
  }
}
