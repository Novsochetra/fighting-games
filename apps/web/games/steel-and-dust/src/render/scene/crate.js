import { COLORS } from '../../art/colors.js';
import { CRATE_COLORS as CRATE } from '../../art/scene-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { point } from '../painter.js';

function drawCrate(painter, crate) {
  const x = Math.round(crate.x - 8);
  const y = crate.y - 15;
  painter.use(COLORS.outline).rect(x - 1, y - 1, 18, 16);
  painter.use(CRATE.wood).rect(x, y, 16, 15);
  painter.use(CRATE.inner).rect(x + 1, y + 1, 14, 13);
  painter.use(CRATE.brace).line(point(x + 2, y + 2), point(x + 13, y + 12), 2);
  painter.use(CRATE.braceShade).line(point(x + 13, y + 2), point(x + 2, y + 12), 1);
  painter.use(CRATE.rim).rect(x, y, 16, 1);
  painter.use(CRATE.dark).rect(x, y + 7, 16, 1);
  for (const [dx, dy] of [
    [1, 1],
    [13, 1],
    [1, 12],
    [13, 12],
  ]) {
    painter.use(CRATE.dark).rect(x + dx, y + dy, 2, 2);
  }
}

export function drawCrates(painter, crates, cameraX) {
  for (const crate of crates) {
    if (!crate.broken && crate.x > cameraX - 20 && crate.x < cameraX + VIEW_WIDTH + 20) {
      drawCrate(painter, crate);
    }
  }
}
