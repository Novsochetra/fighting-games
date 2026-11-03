// the goal seen from the penalty spot: its mouth is drawn at half the sim's size
export const MOUTH_ART = { middle: 192, ground: 124, scale: 0.5 };

export const SHOOTER = { y: 208, ballY: 196, ballGap: -7 };

export const toArt = (point) => ({
  x: Math.round(MOUTH_ART.middle + point.x * MOUTH_ART.scale),
  y: Math.round(MOUTH_ART.ground - point.y * MOUTH_ART.scale),
});

export const shooterX = (run) => Math.round(MOUTH_ART.middle + run.spot.x * MOUTH_ART.scale);

export const ballStart = (run, fromX = run.spot.x) => ({
  x: Math.round(MOUTH_ART.middle + fromX * MOUTH_ART.scale) + SHOOTER.ballGap,
  y: SHOOTER.ballY,
});

// the ball's place along its flight: straight on screen, lifted in an arc, smaller as it goes
export function ballInFlight(run) {
  const ball = run.ball;
  const share = Math.min(1, ball.ticks / ball.total);
  const from = ballStart(run, ball.fromX);
  const to = toArt(ball.to);

  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share - 14 * 4 * share * (1 - share),
    radius: share < 0.45 ? 3 : 2,
    share,
  };
}
