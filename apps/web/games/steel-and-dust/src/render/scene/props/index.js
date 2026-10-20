import { VIEW_WIDTH } from '../../../config.js';
import { drawPropSprite } from './prop-sprites.js';

export function drawProps(painter, { cameraX, props, sheets }) {
  for (const prop of props) {
    if (prop.x > cameraX - 90 && prop.x < cameraX + VIEW_WIDTH + 90) {
      drawPropSprite(painter, sheets, prop);
    }
  }
}
