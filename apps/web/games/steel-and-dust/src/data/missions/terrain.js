import { GROUND_Y } from '../../config.js';

// a flat road has no height table at all, so every flat mission keeps the old arithmetic exactly
export const FLAT_TERRAIN = Object.freeze({ heights: null, platforms: Object.freeze([]) });

// the height of the road under a spot; the ends of the road hold their heights beyond it
export function groundAt(terrain, x) {
  const heights = terrain.heights;
  if (!heights) {
    return GROUND_Y;
  }
  const column = Math.floor(x);
  if (column < 0) {
    return heights[0];
  }
  return column < heights.length ? heights[column] : heights[heights.length - 1];
}

// a zone's `ground` is [offset from its left wall, rise above the road] points joined by straight
// slopes; the same offset twice is a sheer step whose new height starts on that column. Offsets may
// be negative to reach back onto the road
function pointsOf(zone, spec) {
  return spec.ground.map(([offset, rise]) => [zone.left + offset, GROUND_Y - rise]);
}

function raise(heights, [fromX, fromY], [toX, toY]) {
  for (let x = Math.max(0, fromX); x <= Math.min(heights.length - 1, toX); x++) {
    const progress = toX === fromX ? 1 : (x - fromX) / (toX - fromX);
    heights[x] = Math.round(fromY + (toY - fromY) * progress);
  }
}

function layoutHeights(zoneSpecs, zones, length) {
  const heights = new Int16Array(length + 1).fill(GROUND_Y);
  zoneSpecs.forEach((spec, index) => {
    const points = spec.ground ? pointsOf(zones[index], spec) : [];
    for (let i = 1; i < points.length; i++) {
      raise(heights, points[i - 1], points[i]);
    }
  });
  return heights;
}

// a platform's rise is measured from the ground under its left end
function layoutPlatforms(zoneSpecs, zones, heights) {
  return zoneSpecs.flatMap((spec, index) =>
    (spec.platforms ?? []).map(({ at, width, rise, kind }) => {
      const x = zones[index].left + at;
      return { x, y: heights[x] - rise, width, kind };
    }),
  );
}

export function layoutTerrain(zoneSpecs, zones, length) {
  if (!zoneSpecs.some((spec) => spec.ground || spec.platforms)) {
    return FLAT_TERRAIN;
  }
  const heights = layoutHeights(zoneSpecs, zones, length);
  return { heights, platforms: layoutPlatforms(zoneSpecs, zones, heights) };
}
