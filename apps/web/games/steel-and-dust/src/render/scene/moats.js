import { GROUND_Y, VIEW_WIDTH } from '../../config.js';
import { drawGlints } from './ambient/glints.js';
import { drawMoatSplashes } from './moat-splashes.js';

// the light on the ripples of the moat painted behind the breach is the lake's own glints, a few
// to the breach just under the road, the nearer ones lower down throwing longer dashes, seeded
// apart from the lake's so they keep a beat of their own; the water a body falls in lies out of
// sight below the screen
const RIPPLES = { count: 5, top: GROUND_Y + 6, depth: 4, seed: 900 };
// a glint flashing as a star reaches this far above and below its row
const STAR_ARM = 2;

// the moat painted on the back plate shows through the breach, so all that is drawn in it is the
// light on its ripples, cut off at its banks
function drawMoat(painter, { from, to }, { cameraX, tick, glints }) {
  const context = painter.context;
  const effect = {
    ...RIPPLES,
    bottom: RIPPLES.top + RIPPLES.depth,
    drift: 1,
    left: from,
    span: to - from,
  };

  context.save();
  context.beginPath();
  context.rect(from, RIPPLES.top - STAR_ARM, to - from, RIPPLES.depth + STAR_ARM * 2 + 1);
  context.clip();
  // the glints are laid out on the screen, as the lake's are, so the world's scroll is undone
  context.translate(cameraX, 0);
  drawGlints(painter, { effect, tick, cameraX, colors: { glints } });
  context.restore();
}

export function drawMoats(painter, { water, cameraX, tick, glints, summons, sheets }) {
  for (const span of water ?? []) {
    if (span.to > cameraX && span.from < cameraX + VIEW_WIDTH) {
      drawMoat(painter, span, { cameraX, tick, glints });
      drawMoatSplashes(painter, span, { summons, sheets });
    }
  }
}
