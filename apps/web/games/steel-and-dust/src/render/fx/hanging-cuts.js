import { COLORS } from '../../art/colors.js';
import { CUT_FLARE_TICKS, SEVER_TICKS } from '../../sim/summons/hanging-cuts.js';
import { slashArc } from './slash-arc.js';

const LENGTH = 12;
const FLARE_LENGTH = 17;
const SEVERED_LENGTH = 24;
// up and down are squashed, so a steep cut still reads across the body
const SQUASH = 0.6;
// how far a cut bows out, a share of its length: the arc of the dav's swing
const BEND = 0.22;

function slashOf(cut, length) {
  const dx = Math.cos(cut.angle) * length;
  const dy = Math.sin(cut.angle) * length * SQUASH;
  return {
    from: { x: cut.x - dx, y: cut.y - dy },
    to: { x: cut.x + dx, y: cut.y + dy },
    bend: cut.bow * BEND,
  };
}

function drawSlash(painter, cut, { length, width }) {
  const slash = slashOf(cut, length);
  slashArc(painter, { ...slash, width, color: cut.color });
  slashArc(painter, { ...slash, width: Math.max(1, width - 2), color: COLORS.white });
}

// as it is cut: a bright white crescent flaring out over the raider, settling to gold
function drawFlare(painter, cut) {
  const settled = cut.time / CUT_FLARE_TICKS;
  const length = FLARE_LENGTH + (LENGTH - FLARE_LENGTH) * settled;
  drawSlash(painter, cut, { length, width: 5 - Math.round(settled * 2) });
}

// hanging: a crescent of gold across the raider, thick in its middle and pointed at both ends, a
// glint flickering where it crosses the body; landing: it flares white, wide and long, and thins away
export function drawHangingCut(painter, _sheets, cut) {
  if (cut.severedAt !== null) {
    const progress = (cut.time - cut.severedAt) / SEVER_TICKS;
    const length = LENGTH + (SEVERED_LENGTH - LENGTH) * progress;
    painter.alpha(Math.max(0, 1 - progress));
    drawSlash(painter, cut, { length, width: progress < 0.5 ? 5 : 3 });
    painter.alpha(1);
    return;
  }
  if (cut.time < CUT_FLARE_TICKS) {
    drawFlare(painter, cut);
    return;
  }
  drawSlash(painter, cut, { length: LENGTH, width: 3 });
  if ((cut.time >> 2) % 2) {
    painter.use(COLORS.white).diamond(cut.x, cut.y, 1);
  }
}
