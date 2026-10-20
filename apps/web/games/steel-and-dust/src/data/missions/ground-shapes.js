// the pieces a zone's `ground` is built from, as [offset, rise] points from the zone's left wall;
// each one starts and ends on the road, so they chain one after another

// a hill with sloping sides, `slopeWidth` pixels wide each
export function mound(from, to, rise, slopeWidth = rise * 3) {
  return [
    [from, 0],
    [from + slopeWidth, rise],
    [to - slopeWidth, rise],
    [to, 0],
  ];
}

// a raised bank with sheer sides, jumped onto and dropped off
export function bank(from, to, rise) {
  return [
    [from, 0],
    [from, rise],
    [to, rise],
    [to, 0],
  ];
}

// a slope up to a sheer drop, walked up one way and jumped the other
export function ramp(from, to, rise) {
  return [
    [from, 0],
    [to, rise],
    [to, 0],
  ];
}

// steps of [width, rise], each a sheer rise from the last, then a sheer drop back to the road
export function stairs(from, steps) {
  const points = [[from, 0]];
  let x = from;
  for (const [width, rise] of steps) {
    points.push([x, rise], [x + width, rise]);
    x += width;
  }
  points.push([x, 0]);
  return points;
}

// a high ground walked up a slope `slopeWidth` pixels wide and left by a sheer drop at `to`
export function terrace(from, to, rise, slopeWidth = rise * 4) {
  return [
    [from, 0],
    [from + slopeWidth, rise],
    [to, rise],
    [to, 0],
  ];
}

// a high ground jumped onto at `from` and walked down a slope `slopeWidth` pixels wide to `to`
export function ledge(from, to, rise, slopeWidth = rise * 4) {
  return [
    [from, 0],
    [from, rise],
    [to - slopeWidth, rise],
    [to, 0],
  ];
}

// any outline, walked as legs of [run, rise]: each leg goes `run` pixels on to reach `rise`, a
// run of 0 being a sheer step; the last leg comes back down to the road
export function contour(from, legs) {
  const points = [[from, 0]];
  let x = from;
  for (const [run, rise] of legs) {
    x += run;
    points.push([x, rise]);
  }
  return points;
}

// temple steps: climbs `steps` like stairs, the last one being the top, then comes back down the
// same steps the other way, so a dais built of rises no taller than a step can be walked over
export function dais(from, steps) {
  const points = stairs(from, steps).slice(0, -1);
  let x = points.at(-1)[0];
  for (const [width, rise] of steps.slice(0, -1).reverse()) {
    points.push([x, rise], [x + width, rise]);
    x += width;
  }
  points.push([x, 0]);
  return points;
}
