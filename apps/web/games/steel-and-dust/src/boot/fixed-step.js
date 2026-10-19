// the simulation runs at exactly 60 ticks a second whatever the display rate; a long stall
// (a background tab) catches up at most 5 ticks instead of fast-forwarding
const MAX_ELAPSED_MS = 100;
const MAX_TICKS_PER_FRAME = 5;

export function createClock(now) {
  return { accumulator: 0, last: now };
}

export function ticksDue(clock, now, tickMs) {
  clock.accumulator += Math.min(MAX_ELAPSED_MS, now - clock.last);
  clock.last = now;
  let count = 0;
  while (clock.accumulator >= tickMs && count < MAX_TICKS_PER_FRAME) {
    clock.accumulator -= tickMs;
    count++;
  }
  return count;
}
