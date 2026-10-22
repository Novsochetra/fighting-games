import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { clamp } from '../../lib/math.js';
import { drawFxFrame, fxFrameAt } from './fx-sheets.js';

const SHARD_BOUNCE = [0, 1, 2, 3, 2, 1];

// the spot a boulder will land on is marked like every boss danger, a blinking red bar on the
// ground, under a shadow that grows and darkens as it comes down
function drawLandingShadow(painter, rock) {
  const fall = rock.floor - rock.y;
  const half = Math.round(clamp(16 - fall / 16, 6, 14));
  painter.alpha((rock.time >> 2) & 1 ? 0.65 : 0.4).use(COLORS.red);
  painter.rect(rock.x - half, rock.floor - 1, half * 2, 6);
  painter.use(FX_COLORS.dangerLight).rect(rock.x - half, rock.floor - 1, half * 2, 1);
  painter.alpha(clamp(0.75 - fall / 500, 0.4, 0.65)).use(COLORS.outline);
  painter.rect(rock.x - half, rock.floor - 1, half * 2, 2);
  painter.rect(rock.x - half + 2, rock.floor - 2, half * 2 - 4, 1);
  painter.alpha(1);
}

export function drawBoulder(painter, rock, sheets) {
  drawLandingShadow(painter, rock);
  const { frames, ticks } = FX_SPRITES.boulder;
  const frame = Math.floor(rock.time / ticks) % frames;
  drawFxFrame(painter, sheets, {
    name: 'boulder',
    frame,
    x: rock.x,
    y: rock.y,
    facing: rock.direction,
  });
}

export function drawShard(painter, shard) {
  const y = Math.round(shard.y - 3 - SHARD_BOUNCE[shard.time % SHARD_BOUNCE.length]);
  painter.use(FX_COLORS.rockDark).rect(shard.x - 2, y - 1, 4, 4);
  painter.use(FX_COLORS.rock).rect(shard.x - 1, y, 2, 2);
  painter.use(FX_COLORS.rockLight).rect(shard.x - 1, y, 1, 1);
}

// before it bursts up, a spike shows as a crack widening in the road
function drawCrack(painter, spike) {
  const width = Math.round(clamp(3 + (30 + spike.time) / 3, 3, 12));
  painter.use(FX_COLORS.crack).rect(spike.x - width / 2, spike.y - 1, width, 1);
  painter.rect(spike.x - 1, spike.y - 2, 2, 1);
}

// a toppled stalk lies where it fell, then fades
export function drawBamboo(painter, stalk, sheets) {
  const frame = Math.min(3, Math.floor(stalk.time / 6));
  painter.alpha(clamp((70 - stalk.time) / 12, 0, 1));
  drawFxFrame(painter, sheets, {
    name: 'bamboo',
    frame,
    x: stalk.x,
    y: stalk.y,
    facing: stalk.direction,
  });
  painter.alpha(1);
}

export function drawSpike(painter, spike, sheets) {
  if (spike.time < 0) {
    drawCrack(painter, spike);
    return;
  }
  const frame = fxFrameAt('spike', spike.time);
  drawFxFrame(painter, sheets, {
    name: 'spike',
    frame,
    x: spike.x,
    y: spike.y,
    facing: spike.direction,
  });
}
