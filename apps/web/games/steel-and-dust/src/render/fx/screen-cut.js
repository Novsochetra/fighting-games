import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { easeOutCubic } from '../../lib/math.js';
import { slashArc } from './slash-arc.js';

// it opens across the field in this share of its life, then thins away
const OPENING = 0.2;
const HALF_LENGTH = VIEW_WIDTH * 0.6;
const WIDTH = 7;
const GLOW = 0.3;
// it bows up over the field, like one sweep of the dav across it, never down into the ground
const BEND = 0.08;

function ends(effect, half) {
  const dx = Math.cos(effect.angle) * half;
  const dy = Math.sin(effect.angle) * half;
  return {
    from: { x: effect.x - dx, y: effect.y - dy },
    to: { x: effect.x + dx, y: effect.y + dy },
  };
}

// one great curved slash across the whole field as every cut lands: it opens out from its middle, a
// soft glow round a gold edge and a white core, then thins to nothing
export function drawScreenCut(painter, effect, progress) {
  const opened = easeOutCubic(Math.min(1, progress / OPENING));
  const thinning = progress < OPENING ? 1 : 1 - (progress - OPENING) / (1 - OPENING);
  const { from, to } = ends(effect, HALF_LENGTH * opened);
  const width = Math.max(1, WIDTH * thinning);
  painter.alpha(GLOW * thinning);
  slashArc(painter, { from, to, bend: BEND, width: width + 6, color: effect.color });
  painter.alpha(Math.min(1, thinning * 1.5));
  slashArc(painter, { from, to, bend: BEND, width, color: effect.color });
  slashArc(painter, { from, to, bend: BEND, width: width / 2, color: COLORS.white });
  painter.alpha(1);
}
