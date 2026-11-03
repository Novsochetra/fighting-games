// what the ear remembers between calls: the last kick it heard, how the ball was moving and the
// last shot, for a near miss
export const createEar = () => ({
  tick: -1,
  heardKick: null,
  ball: null,
  lastShot: null,
  rang: -Infinity,
});

// a match heard from its start again (a new one, or a restart) begins with nothing remembered
export function earFor(ear, match) {
  if (match.tick < ear.tick) {
    Object.assign(ear, createEar());
  }

  ear.tick = match.tick;

  return ear;
}
