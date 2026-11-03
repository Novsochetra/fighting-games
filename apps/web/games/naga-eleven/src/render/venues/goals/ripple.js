// when a ball goes in, the net of that end remembers the tick and the spot, so it ripples out from
// there for as long as the ball lies in it
const states = new WeakMap();

export function rippleOf(match, end, tick) {
  const { ball } = match;
  const scoredEnd = ball.inGoal === null || ball.inGoal === undefined ? null : 1 - ball.inGoal;
  const last = states.get(match);

  if (scoredEnd === null) {
    states.delete(match);

    return null;
  }

  if (!last || last.end !== scoredEnd) {
    states.set(match, { end: scoredEnd, since: tick, y: ball.y, z: ball.z });
  }

  const state = states.get(match);

  return state.end === end
    ? { y: state.y, z: state.z, age: Math.max(0, tick - state.since) }
    : null;
}
