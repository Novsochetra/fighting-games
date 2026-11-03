import { HUD } from '../../art/hud.js';
import { drawText, measureText } from '../text.js';

export const KEY_CAP = { height: 11, pad: 3 };

export const keyCapWidth = (context, label) =>
  Math.ceil(measureText(context, label, { size: 8 })) + KEY_CAP.pad * 2;

// a key to press, as the touch keys and the pad name it (SHOOT, PASS, RUN): an ink rim, its face
// lit along the top and deep along the foot; `ramp` is its face's (deep to light)
export function drawKeyCap(context, { label, x, y, ramp = HUD.panel }) {
  const width = keyCapWidth(context, label);
  const { height } = KEY_CAP;

  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, width + 2, height + 2);
  context.fillStyle = ramp[2];
  context.fillRect(x, y, width, height);
  context.fillStyle = ramp[3];
  context.fillRect(x, y, width, 1);
  context.fillStyle = ramp[0];
  context.fillRect(x, y + height - 2, width, 2);
  drawText(context, label, {
    x: x + KEY_CAP.pad,
    y: y + 1,
    color: HUD.text,
    shadow: HUD.ink,
    size: 8,
  });

  return width;
}
