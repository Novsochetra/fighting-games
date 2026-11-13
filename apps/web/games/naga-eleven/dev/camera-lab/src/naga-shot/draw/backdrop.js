import { drawBoards } from './stadium/boards.js';
import { drawFlashes } from './stadium/flashes.js';
import { cheerOf, duskOf, flashesOf, poolOf } from './stadium/light.js';
import { drawPitch } from './stadium/pitch.js';
import { drawSky, drawStars } from './stadium/sky.js';
import { drawStand } from './stadium/stand.js';
import { drawTowers } from './stadium/towers.js';

export function drawBackdrop(context, moment) {
  const { camera, clock } = moment;
  const dusk = duskOf(clock);
  const cheer = dusk === 0 ? cheerOf(moment) : 0;
  const frame = clock.frame;

  drawSky(context, { camera, dusk });
  drawStars(context, { camera, frame });
  drawTowers(context, { camera, dusk });

  const standPen = drawStand(context, { camera, dusk, cheer });

  drawFlashes(standPen, { frame, rate: flashesOf(moment) });
  drawPitch(context, { moment, dusk, pool: poolOf(moment) });
  drawBoards(context, { camera, dusk, frame, cheer });
}
