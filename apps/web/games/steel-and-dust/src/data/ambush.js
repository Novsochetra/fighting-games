// a wave marked as an ambush comes in mid-screen instead of walking in from the edges. A drop
// grows its shadow under the trees for `warn` ticks, then the raider falls from above the screen
// and stomps the spot it lands on. A burrow sends a sand mound from the screen's edge after the
// hero for up to `track` ticks, stops it to shake for `rumble`, then bursts the raider up out of it
export const DROP = {
  warn: 66,
  // raiders of one wave fall round the hero this far apart, in turn on either side
  gap: 44,
  fromY: -24,
  stompTicks: 6,
  stompDamage: 8,
};

export const BURROW = {
  speed: 1.6,
  track: 140,
  rumble: 44,
  // a mound starts this far inside the screen's edge, on alternate sides
  inset: 26,
  eruptTicks: 8,
  eruptDamage: 10,
  hopVy: -3.8,
};
