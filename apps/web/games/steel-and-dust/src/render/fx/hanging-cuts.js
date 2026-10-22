import { COLORS } from '../../art/colors.js';
import { SEVER_TICKS } from '../../sim/summons/hanging-cuts.js';
import { taperedLine } from './tapered-line.js';

const LENGTH = 12;
const SEVERED_LENGTH = 24;
// up and down are squashed, as the iai cut's line is, so a steep cut still reads across the body
const SQUASH = 0.6;

function ends(cut, length) {
  const dx = Math.cos(cut.angle) * length;
  const dy = Math.sin(cut.angle) * length * SQUASH;
  return [
    { x: cut.x - dx, y: cut.y - dy },
    { x: cut.x + dx, y: cut.y + dy },
  ];
}

// a slash of gold hanging across the raider, thick in its middle and thinning to points, a glint
// flickering where it crosses the body; when it lands it flares white, wide and long, and thins away
export function drawHangingCut(painter, _sheets, cut) {
  if (cut.severedAt === null) {
    const [from, to] = ends(cut, LENGTH);
    taperedLine(painter, { from, to, width: 3, color: cut.color });
    taperedLine(painter, { from, to, width: 1, color: COLORS.white });
    if ((cut.time >> 2) % 2) {
      painter.use(COLORS.white).diamond(cut.x, cut.y, 1);
    }
    return;
  }
  const progress = (cut.time - cut.severedAt) / SEVER_TICKS;
  const [from, to] = ends(cut, LENGTH + (SEVERED_LENGTH - LENGTH) * progress);
  painter.alpha(Math.max(0, 1 - progress));
  taperedLine(painter, { from, to, width: progress < 0.5 ? 5 : 3, color: cut.color });
  taperedLine(painter, { from, to, width: progress < 0.5 ? 3 : 1, color: COLORS.white });
  painter.alpha(1);
}
