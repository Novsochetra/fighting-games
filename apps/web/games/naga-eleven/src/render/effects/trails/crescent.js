function spansOfRow({ centre, radius, hollow }, row) {
  const dy = row + 0.5 - centre.y;
  const reach = Math.sqrt(Math.max(0, radius * radius - dy * dy));
  const outer = [centre.x - reach, centre.x + reach];
  const inDy = row + 0.5 - hollow.y;

  if (Math.abs(inDy) >= hollow.radius) {
    return [outer];
  }

  const cut = Math.sqrt(hollow.radius * hollow.radius - inDy * inDy);

  return [
    [outer[0], Math.min(outer[1], hollow.x - cut)],
    [Math.max(outer[0], hollow.x + cut), outer[1]],
  ];
}

// a round with a round bitten out of it, row by row: `hollow` is the bite's centre and radius
export function drawCrescent(context, { centre, radius, hollow }, colour) {
  context.fillStyle = colour;

  for (let row = Math.floor(centre.y - radius); row < Math.ceil(centre.y + radius); row += 1) {
    for (const [left, right] of spansOfRow({ centre, radius, hollow }, row)) {
      const from = Math.round(left);
      const to = Math.round(right);

      if (to > from) {
        context.fillRect(from, row, to - from, 1);
      }
    }
  }
}

// a crescent at a point whose hollow opens the way `toward` points, `bite` pixels in from its back
export function crescentAt(point, toward, { radius, bite, hollow }) {
  return {
    centre: point,
    radius,
    hollow: { x: point.x + toward.x * bite, y: point.y + toward.y * bite, radius: hollow },
  };
}
