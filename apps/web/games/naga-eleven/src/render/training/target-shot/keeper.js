import { MANNEQUIN } from '../../../art/training/ground.js';
import { DUMMY } from '../../../training/target-shot/motion.js';
import { drawShadow } from '../people.js';
import { paint } from '../pixels.js';
import { MOUTH_ART } from './view.js';

const HEIGHT = Math.round(DUMMY.height * MOUTH_ART.scale);

// one arm thrown out and a little up, ending in a big keeper's glove
function drawArm(context, { x, top, side }) {
  const reach = side < 0 ? x - 15 : x + 1;

  paint(context, MANNEQUIN.outline, [reach - 1, top - 1, 16, 6]);
  paint(context, MANNEQUIN.face, [reach, top, 14, 4]);
  paint(context, MANNEQUIN.light, [reach, top, 14, 1]);

  const glove = side < 0 ? reach - 6 : reach + 12;

  paint(context, MANNEQUIN.outline, [glove - 1, top - 6, 9, 10]);
  paint(context, MANNEQUIN.glove, [glove, top - 5, 7, 8]);
  paint(context, MANNEQUIN.gloveLight, [glove, top - 5, 7, 2]);
}

// the keeper dummy: a yellow mannequin on a sled, arms thrown wide
export function drawKeeperDummy(context, { x }) {
  const left = Math.round(MOUTH_ART.middle + x * MOUTH_ART.scale);
  const ground = MOUTH_ART.ground;
  const top = ground - HEIGHT;

  drawShadow(context, { x: left + 2, y: ground, width: 12, alpha: 0.3 });
  paint(context, MANNEQUIN.base[0], [left - 9, ground - 4, 19, 4]);
  paint(context, MANNEQUIN.base[1], [left - 9, ground - 4, 19, 1]);
  paint(context, MANNEQUIN.pole[0], [left - 1, ground - 14, 3, 10]);
  drawArm(context, { x: left - 6, top: top + 14, side: -1 });
  drawArm(context, { x: left + 7, top: top + 14, side: 1 });
  paint(context, MANNEQUIN.outline, [left - 8, top + 10, 17, 28]);
  paint(context, MANNEQUIN.face, [left - 7, top + 11, 15, 26]);
  paint(context, MANNEQUIN.light, [left - 7, top + 11, 4, 22]);
  paint(context, MANNEQUIN.shade, [left + 4, top + 11, 4, 26]);
  paint(context, MANNEQUIN.outline, [left - 5, top, 11, 11]);
  paint(context, MANNEQUIN.face, [left - 4, top + 1, 9, 9]);
  paint(context, MANNEQUIN.light, [left - 4, top + 1, 4, 3]);
  paint(context, MANNEQUIN.shade, [left + 2, top + 3, 3, 7]);
}
