import { VIEW_WIDTH } from '../../config.js';
import { STAMPEDE } from '../../data/ultimates/stampede.js';
import { shake } from '../fx/camera-fx.js';
import { sendStag } from '../summons/stags.js';
import { finaleFlash, finishUlt, poseFrame } from './common.js';

const OFFSCREEN = 48;
const RANGE = VIEW_WIDTH + OFFSCREEN * 2 + 40;

// a herd enters from the screen edge behind its run, so it crosses the whole view
function edgeBehind(game, direction) {
  return direction > 0 ? game.camera.x - OFFSCREEN : game.camera.x + VIEW_WIDTH + OFFSCREEN;
}

function stampedeHerd(game, player, { side, lanes }) {
  const direction = player.facing * side;
  const x = edgeBehind(game, direction);
  lanes.forEach((lane, i) => {
    sendStag(game, {
      x: x - direction * i * 22,
      lane,
      direction,
      speed: STAMPEDE.speed,
      scale: 0.95,
      hit: STAMPEDE.stag,
      range: RANGE + i * 22,
    });
  });
  shake(game, 2, 24);
}

function greatStag(game, player) {
  const direction = player.facing;
  sendStag(game, {
    x: edgeBehind(game, direction),
    lane: 10,
    direction,
    speed: STAMPEDE.greatSpeed,
    scale: 1.7,
    hit: STAMPEDE.greatStag,
    range: RANGE + 40,
    great: true,
  });
  game.io.sfx('ult');
}

// the white-out waits for the great stag's first raider, however far it has to run
function flashOnImpact(game) {
  const great = game.summons.find((summon) => summon.kind === 'stag' && summon.great);
  if (great && great.hitTargets.size && !great.flashed) {
    great.flashed = true;
    finaleFlash(game);
  }
}

// Antler: stamp and roar; herds thunder across from both edges, then the great stag tramples all
export function runStampede(game, player, time) {
  player.ultFrame = poseFrame(time, STAMPEDE.poseTicks);
  const since = time - STAMPEDE.intro;
  for (const [at, side, lanes] of STAMPEDE.herds) {
    if (since === at) {
      stampedeHerd(game, player, { side, lanes });
    }
  }
  if (since === STAMPEDE.greatStagAt) {
    greatStag(game, player);
  }
  flashOnImpact(game);
  if (time >= STAMPEDE.end) {
    finishUlt(player);
  }
}
