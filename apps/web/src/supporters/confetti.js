// Paper bursts up and out from a point, slows in the air and falls. Distances are CSS pixels,
// times seconds.
export const CONFETTI = {
  count: 140,
  gravity: 1300,
  drag: 1.6,
  flipSpeed: 9,
  minSpeed: 420,
  extraSpeed: 620,
  spread: 1.7,
  minSize: 6,
  extraSize: 6,
};

export function launchPieces({ origin, colors, random = Math.random, count = CONFETTI.count }) {
  const { minSpeed, extraSpeed, spread, minSize, extraSize } = CONFETTI;
  return Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (random() - 0.5) * spread;
    const speed = minSpeed + random() * extraSpeed;
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: random() * Math.PI * 2,
      spin: (random() - 0.5) * 12,
      flip: random() * Math.PI * 2,
      size: minSize + random() * extraSize,
      color: colors[Math.floor(random() * colors.length)],
    };
  });
}

export function stepPieces(pieces, seconds) {
  const slowing = Math.exp(-CONFETTI.drag * seconds);
  for (const piece of pieces) {
    piece.vx *= slowing;
    piece.vy = piece.vy * slowing + CONFETTI.gravity * seconds;
    piece.x += piece.vx * seconds;
    piece.y += piece.vy * seconds;
    piece.rotation += piece.spin * seconds;
    piece.flip += CONFETTI.flipSpeed * seconds;
  }
  return pieces;
}

// Fully there for most of the burst, then fades out over its last quarter.
export function opacityAt(elapsed, duration) {
  const fadeFrom = duration * 0.75;
  if (elapsed <= fadeFrom) {
    return 1;
  }
  return Math.max(0, 1 - (elapsed - fadeFrom) / (duration - fadeFrom));
}
