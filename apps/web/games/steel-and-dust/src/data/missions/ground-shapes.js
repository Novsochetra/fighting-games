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

// temple steps: climbs `steps` like stairs, the last one being the top, then comes back down the
// same steps the other way, so a dais built of rises no taller than a step can be walked over
export function terrace(from, steps) {
  const points = stairs(from, steps).slice(0, -1);
  let x = points.at(-1)[0];
  for (const [width, rise] of steps.slice(0, -1).reverse()) {
    points.push([x, rise], [x + width, rise]);
    x += width;
  }
  points.push([x, 0]);
  return points;
}
