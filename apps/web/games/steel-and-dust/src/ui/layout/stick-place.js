import { clamp } from '../../lib/math.js';

// a thumb that lands just off the stick's rim still catches it
const REACH = 1.5;

function inside(value, radius, length) {
  return radius * 2 >= length ? length / 2 : clamp(value, radius, length - radius);
}

// a custom stick rests at its centre, kept whole on the layer, and its zone is the half of the
// layer it stands on, widened to reach past its rim when it stands near the middle. `radius` is the
// base's in px; the zone is in px of the layer, and `rest` in px of the zone, which holds the base
export function customStickPlace({ stick, layer, radius }) {
  const centre = {
    x: inside(stick.x * layer.width, radius, layer.width),
    y: inside(stick.y * layer.height, radius, layer.height),
  };
  const onLeft = centre.x <= layer.width / 2;
  const fromEdge = onLeft ? centre.x : layer.width - centre.x;
  const width = clamp(fromEdge + radius * REACH, layer.width / 2, layer.width);
  const left = onLeft ? 0 : layer.width - width;
  return { zone: { left, width }, rest: { x: centre.x - left, y: centre.y } };
}
