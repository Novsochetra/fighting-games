import { HUD } from '../../art/hud.js';

export function drawPanel(context, { x, y, width, height }, ramp = HUD.panel) {
  context.globalAlpha = 0.4;
  context.fillStyle = HUD.ink;
  context.fillRect(x, y + height + 1, width + 2, 1);
  context.fillRect(x + width + 1, y, 1, height + 1);
  context.globalAlpha = 1;
  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, width + 2, height + 2);
  context.fillStyle = ramp[1];
  context.fillRect(x, y, width, height);
  context.fillStyle = ramp[3];
  context.fillRect(x, y, width, 1);
  context.fillStyle = ramp[2];
  context.fillRect(x, y + 1, width, 1);
  context.fillStyle = ramp[0];
  context.fillRect(x, y + height - 1, width, 1);
}

export function drawInset(context, { x, y, width, height }) {
  context.fillStyle = HUD.inset;
  context.fillRect(x, y, width, height);
  context.fillStyle = HUD.panel[0];
  context.fillRect(x, y + height - 1, width, 1);
}
