import { SHOT_ART } from '../colors.js';
import { GROUND, VIEW, WORLD } from '../world.js';
import { worldPen } from '../camera/world-pen.js';

// a placeholder until the stadium is drawn: the night, the stand and the grass
export function drawBackdrop(context, { camera }) {
  const pen = worldPen(context, camera);

  context.fillStyle = SHOT_ART.sky[0];
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  pen.rect([0, GROUND - 90, WORLD.width, 70], SHOT_ART.sky[2]);
  pen.rect([0, GROUND - 14, WORLD.width, WORLD.height], SHOT_ART.grass[1]);
}
