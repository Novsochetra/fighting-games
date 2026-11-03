const BLOCK = 7;

function drawSide(context, { x, top, bottom, art, shimmer }) {
  for (let y = bottom - BLOCK; y > top - BLOCK; y -= BLOCK + 1) {
    const from = Math.max(top, y);

    context.fillStyle = art.body[2];
    context.fillRect(x, from, 2, y + BLOCK - from);
    context.fillStyle = art.body[3];
    context.fillRect(x, from, 1, y + BLOCK - from);
    context.fillStyle = art.body[0];
    context.fillRect(x, y + BLOCK, 2, 1);
  }

  if (shimmer > top && shimmer < bottom) {
    context.fillStyle = art.body[4];
    context.fillRect(x, Math.round(shimmer), 2, 6);
  }
}

function drawArch(context, { centre, radius, art }) {
  context.fillStyle = art.body[3];

  for (let i = 1; i < 12; i += 1) {
    const angle = Math.PI + (i / 12) * Math.PI;

    context.fillRect(
      Math.round(centre.x + Math.cos(angle) * radius),
      Math.round(centre.y + Math.sin(angle) * radius),
      2,
      2,
    );
  }
}

// a shimmering outline of stone about the player, for blocks and walls: block-built sides, an
// arch over his head, a gleam running up it
export function drawStone(context, { foot, height, art, tick, strength }) {
  const radius = 12;
  const left = Math.round(foot.x) - radius - 1;
  const right = Math.round(foot.x) + radius - 1;
  const bottom = Math.round(foot.y) + 1;
  const top = Math.round(foot.y - height + radius - 4);
  const shimmer = bottom - ((tick * 2) % (height + 24));

  context.globalAlpha = strength * 0.9;
  drawSide(context, { x: left, top, bottom, art, shimmer });
  drawSide(context, { x: right, top, bottom, art, shimmer });
  drawArch(context, { centre: { x: foot.x, y: top }, radius, art });
  context.globalAlpha = 1;
}
