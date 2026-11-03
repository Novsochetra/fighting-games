// an ellipse of short dashes, `turn` turning them round it; `back` colours the dashes on its far
// half, so a ring on the ground reads as round the feet
export function drawDashedEllipse(context, ring) {
  const { x, y, radiusX, radiusY, count, size = 2, turn = 0, colour, back = colour } = ring;

  for (let i = 0; i < count; i += 1) {
    const angle = turn + (i / count) * Math.PI * 2;
    const isNear = Math.sin(angle) > 0;

    context.fillStyle = isNear ? colour : back;
    context.fillRect(
      Math.round(x + Math.cos(angle) * radiusX - size / 2),
      Math.round(y + Math.sin(angle) * radiusY),
      size,
      1,
    );
  }
}
