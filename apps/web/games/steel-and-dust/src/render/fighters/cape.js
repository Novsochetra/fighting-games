export function drawCape(painter, scarf, palette) {
  const cloth = palette.cape || palette.jacket;
  for (let i = 1; i < scarf.length; i++) {
    painter.use(palette.outline).line(scarf[i - 1], scarf[i], 5);
  }
  for (let i = 1; i < scarf.length; i++) {
    painter.use(i > 4 ? palette.jacketShade : cloth).line(scarf[i - 1], scarf[i], 3);
  }
  for (let i = 2; i < scarf.length; i++) {
    const from = { x: scarf[i - 1].x, y: scarf[i - 1].y + 1 };
    const to = { x: scarf[i].x, y: scarf[i].y + 1 };
    painter.use(i > 4 ? palette.glowShade : palette.glow).line(from, to, 1);
  }
}
