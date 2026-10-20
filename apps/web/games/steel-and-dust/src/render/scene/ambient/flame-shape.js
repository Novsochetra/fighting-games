import { trait } from './motion.js';

const FRAME_TICKS = 4;
const SALT = 23000;

// a flame is three tongues rooted side by side, the middle one tallest; every few ticks they
// reach and lean anew, while a slow sway bends them all the same way. The whole shape holds
// between those ticks, as a drawn animation would, rather than shimmering every tick
export function flameTongues(spot, { tick, height }) {
  const phase = Math.floor(trait(spot.index + SALT, 1) * FRAME_TICKS * 8);
  const frame = Math.floor((tick + phase) / FRAME_TICKS);
  const seed = (spot.index + SALT) * 1031 + frame;
  const sway = Math.sin(frame * FRAME_TICKS * 0.045 + spot.index * 1.7) * 1.2;
  const reach = (slot, low, spread) => height * (low + trait(seed, slot) * spread);
  return [
    { rootX: 0, half: 3.2, height: reach(1, 0.78, 0.3), lean: sway + (trait(seed, 2) - 0.5) * 2 },
    { rootX: -1.6, half: 2.1, height: reach(3, 0.38, 0.32), lean: sway - 0.8 - trait(seed, 4) },
    { rootX: 1.6, half: 2.1, height: reach(5, 0.38, 0.32), lean: sway + 0.8 + trait(seed, 6) },
  ];
}

// an inner, hotter layer is the same tongues thinner and shorter, so it hugs the base
function shrinkTongues(tongues, depth) {
  return tongues
    .map((tongue) => ({
      rootX: tongue.rootX * (1 - depth * 0.2),
      half: tongue.half - depth * 0.85,
      height: tongue.height * (1 - depth * 0.24),
      lean: tongue.lean * (1 - depth * 0.3),
    }))
    .filter((tongue) => tongue.half > 0.2 && tongue.height >= 1);
}

// widest a little above its root, narrowing to a point at the tip
function tongueSpan(tongue, row) {
  const rise = row / tongue.height;
  if (rise >= 1) {
    return null;
  }
  const center = tongue.rootX + tongue.lean * rise * rise;
  const half = tongue.half * Math.sin(Math.PI * (0.3 + 0.7 * rise));
  const left = Math.round(center - half);
  return [left, Math.max(left + 1, Math.round(center + half))];
}

function mergeSpans(spans) {
  const merged = [];
  for (const [left, right] of spans.sort((first, second) => first[0] - second[0])) {
    const last = merged.at(-1);
    if (last && left <= last[1]) {
      last[1] = Math.max(last[1], right);
    } else {
      merged.push([left, right]);
    }
  }
  return merged;
}

// the [left, right) runs the tongues cover on each row, counted up from the base
function flameRows(tongues) {
  const tallest = Math.ceil(Math.max(0, ...tongues.map((tongue) => tongue.height)));
  const rows = [];
  for (let row = 0; row < tallest; row++) {
    rows.push(mergeSpans(tongues.map((tongue) => tongueSpan(tongue, row)).filter(Boolean)));
  }
  return rows;
}

function overlap(spans, bounds) {
  return spans.flatMap(([left, right]) =>
    bounds
      .map(([boundLeft, boundRight]) => [Math.max(left, boundLeft), Math.min(right, boundRight)])
      .filter(([from, to]) => to > from),
  );
}

function insetRows(rows) {
  return rows.map((spans) => spans.map(([left, right]) => [left + 1, right - 1]));
}

function nestRows(rows, outerRows) {
  return rows.map((spans, row) => overlap(spans, outerRows[row] ?? []));
}

// the rows of every layer, the outer, coolest one first; the hotter layers keep a pixel inside
// the outer one so the flame keeps its outline, and each stays within the layer around it
export function flameLayers(tongues, count) {
  const layers = [flameRows(tongues)];
  let bounds = insetRows(layers[0]);
  for (let depth = 1; depth < count; depth++) {
    const rows = nestRows(flameRows(shrinkTongues(tongues, depth)), bounds);
    layers.push(rows);
    bounds = rows;
  }
  return layers;
}
