import { WORLD_VIEW } from '../../config.js';
import { clamp } from '../../sim/vector.js';
import { FOCUS_ROW, groundAtScale, scaleAt } from './lens.js';

const HALF_WIDTH = WORLD_VIEW.width / 2;
// past each goal line the view shows the net and this much more
const END_GAP = 56;
// looking far, the far touchline comes no lower than this row, so the stands never fill the view
const FAR_LINE_ROW = 300;
// what the venue lays beyond the near touchline: the boards and the ground under them
export const NEAR_RUN = 76;

function depthRange(lens, pitch) {
  const farthest = groundAtScale(lens, scaleAt(lens, 0) + (FOCUS_ROW - FAR_LINE_ROW) / lens.height);
  const nearest = groundAtScale(
    lens,
    scaleAt(lens, pitch.width + NEAR_RUN) - (WORLD_VIEW.height - FOCUS_ROW) / lens.height,
  );

  if (farthest > nearest) {
    return { minY: (farthest + nearest) / 2, maxY: (farthest + nearest) / 2 };
  }

  return { minY: farthest, maxY: nearest };
}

export function boundsFor(lens, { pitch, goal }) {
  return {
    ...depthRange(lens, pitch),
    length: pitch.length,
    width: pitch.width,
    endGap: goal.depth + END_GAP,
  };
}

export const clampDepth = (bounds, y) => clamp(y, bounds.minY, bounds.maxY);

// the near touchline is held inside the ends, so a near corner flag is always in reach of the
// view; the rows behind it see further past the goal lines, and the venue lays its ground and
// stands out that far. Any camera on the rail stops at the same x, whatever depth it looks at.
export function clampAlong(bounds, lens, { x }) {
  const reach = HALF_WIDTH / scaleAt(lens, bounds.width);
  const low = reach - bounds.endGap;
  const high = bounds.length + bounds.endGap - reach;

  return low > high ? bounds.length / 2 : clamp(x, low, high);
}
