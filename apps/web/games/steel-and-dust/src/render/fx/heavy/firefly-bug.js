import { FIREFLY_HEAVY_ART as ART } from '../../../art/heavy-fx/firefly.js';
import { PIXEL, fineRect } from '../fine-pixels.js';

const LANTERNS = [ART.lanternDim, ART.lantern, ART.lanternHot];

// eight ways a firefly can face; still, it hovers head up
function headingOf(vx, vy) {
  const across = Math.abs(vx);
  const down = Math.abs(vy);
  const x = across >= down * 0.5 ? Math.sign(vx) : 0;
  const y = down >= across * 0.5 ? Math.sign(vy) : 0;
  return x || y ? { x, y } : { x: 0, y: -1 };
}

// a flashing lantern's glow as pixel art paints one, a plus of light; painted over, not added, so
// it stays a glow on the pale mist as well as on the dark
function drawHalo(painter, { x, y, alpha }) {
  painter.alpha(alpha * 0.75);
  painter
    .use(ART.lanternHot)
    .rect(x - 1, y, 3, 1)
    .rect(x, y - 1, 1, 3);
  painter.alpha(alpha * 0.4);
  painter
    .rect(x - 2, y, 1, 1)
    .rect(x + 2, y, 1, 1)
    .rect(x, y - 2, 1, 1)
    .rect(x, y + 2, 1, 1);
}

// the wings beat: spread out to the sides on one tick, folded back over the shell on the next
function drawWings(context, { shellX, shellY, head, flap }) {
  const sideX = -head.y;
  const sideY = head.x;
  const reach = flap ? 0.75 : 0.25;
  const back = flap ? 0 : 0.25;
  context.fillStyle = flap ? ART.wingLight : ART.wing;
  for (const side of [-1, 1]) {
    const x = shellX + 0.25 + sideX * side * reach - head.x * back;
    const y = shellY + 0.25 + sideY * side * reach - head.y * back;
    fineRect(context, { x, y, width: PIXEL, height: PIXEL });
  }
}

// a firefly: a dark shell, beating cyan wings and a lantern behind them, dim (0), lit (1) or
// flashing white (2); `fade` thins the whole bug as it blinks out
export function drawBug(painter, { x, y, vx, vy, level, flap, fade = 1 }) {
  const left = Math.round(x);
  const top = Math.round(y);
  const head = headingOf(vx, vy);
  const alpha = Math.max(0, Math.min(1, fade));
  painter.alpha(alpha);
  if (level === 2) {
    drawHalo(painter, { x: left, y: top, alpha });
    painter.alpha(alpha);
  }
  painter.use(ART.shell).rect(left + head.x, top + head.y, 1, 1);
  drawWings(painter.context, { shellX: left + head.x, shellY: top + head.y, head, flap });
  painter.use(LANTERNS[level]).rect(left, top, 1, 1);
  if (level === 2) {
    painter.context.fillStyle = ART.heart;
    fineRect(painter.context, { x: left, y: top, width: PIXEL, height: PIXEL });
  }
  painter.alpha(1);
}
