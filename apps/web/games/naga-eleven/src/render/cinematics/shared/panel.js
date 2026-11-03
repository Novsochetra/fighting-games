import { CINE } from '../../../art/cinematics/palette.js';
import { VIEW } from '../../../config.js';

const whole = ({ x, y, width, height }) => ({
  x: Math.round(x),
  y: Math.round(y),
  width: Math.round(width),
  height: Math.round(height),
});

export function drawBox(context, rect, ramp = CINE.panel) {
  const { x, y, width, height } = whole(rect);

  context.globalAlpha = 0.45;
  context.fillStyle = CINE.ink;
  context.fillRect(x + 2, y + height + 1, width, 2);
  context.fillRect(x + width + 1, y + 2, 2, height);
  context.globalAlpha = 1;
  context.fillStyle = CINE.ink;
  context.fillRect(x - 1, y - 1, width + 2, height + 2);
  context.fillStyle = ramp[1];
  context.fillRect(x, y, width, height);
  context.fillStyle = ramp[3];
  context.fillRect(x, y, width, 1);
  context.fillStyle = ramp[2];
  context.fillRect(x, y + 1, width, 1);
  context.fillRect(x, y + 1, 1, height - 2);
  context.fillStyle = ramp[0];
  context.fillRect(x, y + height - 1, width, 1);
}

function shadeOfRow(row, rows) {
  if (row === 0) {
    return 3;
  }

  return row === rows - 1 && rows > 2 ? 1 : 2;
}

export function drawRampBar(context, { x, y, width, height }, ramp) {
  const rows = Math.round(height);

  for (let row = 0; row < rows; row += 1) {
    context.fillStyle = ramp[shadeOfRow(row, rows)];
    context.fillRect(Math.round(x), Math.round(y) + row, Math.round(width), 1);
  }
}

// rows leaning right as they go down, as a band slashes across a broadcast; `slant` is how many
// rows it takes to lean one pixel
export function drawSlantRows(context, { x, y, width, height, slant = 2 }, colour) {
  context.fillStyle = colour;

  for (let row = 0; row < Math.round(height); row += 1) {
    const lean = Math.round((row - height / 2) / slant);

    context.fillRect(Math.round(x) - lean, Math.round(y) + row, Math.round(width), 1);
  }
}

export function dimView(context, alpha) {
  if (alpha <= 0) {
    return;
  }

  context.globalAlpha = Math.min(1, alpha);
  context.fillStyle = CINE.dim;
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  context.globalAlpha = 1;
}

export function drawInset(context, { x, y, width, height }) {
  context.fillStyle = CINE.ink;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  context.fillStyle = CINE.inset;
  context.fillRect(Math.round(x) + 1, Math.round(y) + 1, Math.round(width) - 2, height - 2);
  context.fillStyle = CINE.panel[2];
  context.fillRect(Math.round(x) + 1, Math.round(y + height) - 1, Math.round(width) - 2, 1);
}
