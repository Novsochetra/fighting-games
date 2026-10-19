import { GROUND_Y, VIEW_WIDTH } from '../../../config.js';
import { PROPS } from '../../../data/stage.js';
import { drawBarrel } from './barrel.js';
import { drawPalm } from './palm.js';
import { drawSandbags } from './sandbags.js';
import { drawSign } from './sign.js';
import { drawTank } from './tank.js';
import { drawWall } from './wall.js';

const DRAW_PROP = {
  sandbags: drawSandbags,
  barrel: drawBarrel,
  sign: drawSign,
  palm: drawPalm,
  tank: drawTank,
  wall: drawWall,
};

export function drawProps(painter, cameraX) {
  for (const prop of PROPS) {
    if (prop.x > cameraX - 90 && prop.x < cameraX + VIEW_WIDTH + 90) {
      DRAW_PROP[prop.kind](painter, prop.x, GROUND_Y);
    }
  }
}
