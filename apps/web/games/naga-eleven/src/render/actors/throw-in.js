// a throw-in taker holds the ball from when he is set on the line until he lets it go
export const isHoldingThrow = (match, player) =>
  match.phase === 'restart' &&
  match.restart?.kind === 'throwIn' &&
  Boolean(match.restart.set) &&
  match.ball.owner === player.index;

export const throwerOf = (match) =>
  match.players.find((player) => isHoldingThrow(match, player)) ?? null;

// A taker faces into the pitch, whatever way he ran to the line: toward the camera from the far
// touchline, away from it from the near one. The throw pose is drawn those two ways.
export const intoPitch = (match, player) => ({
  x: 0,
  y: player.y < match.pitch.width / 2 ? 1 : -1,
});
