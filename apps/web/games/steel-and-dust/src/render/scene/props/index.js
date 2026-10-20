import { GROUND_Y, VIEW_WIDTH } from '../../../config.js';
import { drawBarrel } from './barrel.js';
import { drawPalm } from './palm.js';
import { drawPropSprite, isSpriteProp } from './prop-sprites.js';
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

function drawProp(painter, sheets, { kind, x }) {
  if (isSpriteProp(kind)) {
    drawPropSprite(painter, sheets, { kind, x, y: GROUND_Y });
  } else {
    DRAW_PROP[kind](painter, x, GROUND_Y);
  }
}

export function drawProps(painter, { cameraX, props, sheets }) {
  for (const prop of props) {
    if (prop.x > cameraX - 90 && prop.x < cameraX + VIEW_WIDTH + 90) {
      drawProp(painter, sheets, prop);
    }
  }
}
