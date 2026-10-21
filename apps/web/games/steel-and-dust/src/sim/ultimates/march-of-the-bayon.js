import { VIEW_WIDTH } from '../../config.js';
import { MARCH_OF_THE_BAYON } from '../../data/ultimates/march-of-the-bayon.js';
import { randomBetween } from '../../lib/math.js';
import { themeOf } from '../fighters/hero-colors.js';
import { shake } from '../fx/camera-fx.js';
import { raiseSoldier } from '../summons/soldiers.js';
import { splitGround } from './bayon-split.js';
import { finishUlt, hitEveryTarget } from './common.js';

const { poseTicks, ranks, spacing, edge, clearOfHero, wave, beats } = MARCH_OF_THE_BAYON;
const { chains, blow, rank: lastBlow, leapAt, leapHeight, chopAt, end } = MARCH_OF_THE_BAYON;
const BLAZE_FRAMES = [2, 3, 4];
const BLAZE_TICKS = 6;
const CHOP_TICKS = 6;
const MOTE_EVERY = 3;
const ECHO_EVERY = 2;

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

// how high the leap has carried him: an arc off the ground and back down onto the chop
export function leapLift(time) {
  if (time <= leapAt || time >= chopAt) {
    return 0;
  }
  const progress = (time - leapAt) / (chopAt - leapAt);
  return leapHeight * 4 * progress * (1 - progress);
}

// where a rank's soldiers stand, how long each waits for the wave rising out from his feet and the
// chain of moves it fights; a rank stands between the last one's soldiers, and none on top of him
export function rankLayout(game, player, rank) {
  const soldiers = [];
  const right = game.camera.x + VIEW_WIDTH - edge;
  for (let x = game.camera.x + edge + rank.shift; x <= right; x += spacing) {
    const distance = Math.abs(x - player.x);
    if (distance >= clearOfHero) {
      const wait = Math.round((distance / VIEW_WIDTH) * wave);
      soldiers.push({ x, wait, moves: chains[soldiers.length % chains.length] });
    }
  }
  return soldiers;
}

function raiseRank(game, player, rank) {
  const direction = player.facing * rank.facing;
  for (const soldier of rankLayout(game, player, rank)) {
    raiseSoldier(game, { ...soldier, direction, beats });
  }
  game.io.sfx('relief', false, { x: player.x });
}

// a rank steps out in a wave and fights in step: its blows stagger every raider, its last throws them
function marchRanks(game, player, time) {
  for (const rank of ranks) {
    const beat = beats.indexOf(time - rank.at);
    if (time === rank.at) {
      raiseRank(game, player, rank);
    }
    if (beat >= 0) {
      const last = beat === beats.length - 1;
      hitEveryTarget(game, player, last ? lastBlow : blow);
      shake(game, last ? 3 : 1, last ? 10 : 4);
    }
  }
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

export function runMarchOfTheBayon(game, player, time) {
  player.ultFrame = marchFrame(time);
  marchRanks(game, player, time);
  if (time >= poseTicks * 2 && time < leapAt && time % MOTE_EVERY === 0) {
    blaze(game, player);
  }
  if (time >= leapAt && time <= chopAt) {
    leap(game, player, time);
  }
  if (time === chopAt) {
    splitGround(game, player);
  }
  if (time >= end) {
    finishUlt(player);
  }
}
