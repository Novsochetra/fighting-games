// pixel-art drawing on a 2D context; `use(color)` picks the color for the next shape
export function createPainter(context) {
  const painter = {
    context,
    color: null,
    use(color) {
      painter.color = color;
      return painter;
    },
    alpha(value) {
      context.globalAlpha = value;
      return painter;
    },
    rect(x, y, width, height) {
      context.fillStyle = painter.color;
      context.fillRect(Math.round(x), Math.round(y), width, height);
      return painter;
    },
    outline(x, y, width, height) {
      outlineRect(painter, { x, y, width, height });
      return painter;
    },
    line(from, to, thickness) {
      drawLine(context, { from, to, thickness, color: painter.color });
      return painter;
    },
    limb(from, to, thickness, outlineColor) {
      const color = painter.color;
      if (outlineColor) {
        painter.use(outlineColor).line(from, to, thickness + 2);
      }
      return painter.use(color).line(from, to, thickness);
    },
    diamond(x, y, radius) {
      drawDiamond(context, { x, y, radius, color: painter.color });
      return painter;
    },
  };
  return painter;
}

function outlineRect(painter, box) {
  const x = Math.round(box.x);
  const y = Math.round(box.y);
  const width = Math.round(box.width);
  const height = Math.round(box.height);
  painter.rect(x, y, width, 1).rect(x, y + height - 1, width, 1);
  painter.rect(x, y, 1, height).rect(x + width - 1, y, 1, height);
}

// Bresenham, stamping a square brush; capped so a bad point cannot hang the frame
function drawLine(context, { from, to, thickness, color }) {
  let x = Math.round(from.x);
  let y = Math.round(from.y);
  const endX = Math.round(to.x);
  const endY = Math.round(to.y);
  context.fillStyle = color;
  const offset = (thickness / 2) | 0;
  const dx = Math.abs(endX - x);
  const stepX = x < endX ? 1 : -1;
  const dy = -Math.abs(endY - y);
  const stepY = y < endY ? 1 : -1;
  let error = dx + dy;
  for (let steps = 0; ; steps++) {
    context.fillRect(x - offset, y - offset, thickness, thickness);
    if ((x === endX && y === endY) || steps + 1 > 600) {
      break;
    }
    const doubled = 2 * error;
    if (doubled >= dy) {
      error += dy;
      x += stepX;
    }
    if (doubled <= dx) {
      error += dx;
      y += stepY;
    }
  }
}

function drawDiamond(context, { x, y, radius, color }) {
  context.fillStyle = color;
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  for (let dy = -radius; dy <= radius; dy++) {
    const half = radius - Math.abs(dy);
    context.fillRect(centerX - half, centerY + dy, half * 2 + 1, 1);
  }
}

export function point(x, y) {
  return { x, y };
}
