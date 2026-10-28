import { DROP } from '../../data/ambush.js';
import { clamp, smoothstep } from '../../lib/math.js';

const TURN = Math.PI * 2;
// how far the trees right over a raider move, in pixels: the bough sinks under its weight, dipping
// past it and back as it settles, and tips sideways as it lands
const WEIGHT = 2;
const SETTLE = { period: 26, damping: 0.3 };
const LANDING = { tip: 1.3, period: 30, decay: 14 };
// once it has settled, the raider shifts its weight, slowly: the bough leans aside and eases up a
// little, then comes back
const RESTLESS = { from: 18, ticks: 26, sway: 0.9, sag: -0.4 };
// getting ready, it crouches, pressing the bough down further, and for the last ticks the bough
// trembles, harder and harder
const CROUCH = 1;
const TREMBLE = { from: 46, ease: 10, sway: 1.1, period: 10 };
// let go, the bough springs up past where it rests and whips aside, swinging back, dying away
const SPRING = { period: 22, decay: 9, whip: 1.4 };

// the weight landing on a spring: it sinks past where it comes to rest, then settles
function settled(time) {
  const { period, damping } = SETTLE;
  const natural = TURN / period;
  const swing = natural * Math.sqrt(1 - damping * damping);
  const lead = damping / Math.sqrt(1 - damping * damping);
  const fade = Math.exp(-damping * natural * time);

  return 1 - fade * (Math.cos(swing * time) + lead * Math.sin(swing * time));
}

function landingTip(time) {
  return LANDING.tip * Math.exp(-time / LANDING.decay) * Math.sin((TURN * time) / LANDING.period);
}

// eased in and out, there and back
function shifting(time) {
  const progress = clamp((time - RESTLESS.from) / RESTLESS.ticks, 0, 1);

  return Math.sin(Math.PI * progress) ** 2;
}

function trembling(time) {
  const building = smoothstep((time - TREMBLE.from) / TREMBLE.ease);

  return TREMBLE.sway * building * Math.sin((TURN * (time - DROP.warn)) / TREMBLE.period);
}

function waiting(time) {
  const ready = smoothstep((time - (DROP.warn - DROP.ready)) / DROP.ready);
  const shift = shifting(time);

  return {
    sway: landingTip(time) + RESTLESS.sway * shift + trembling(time),
    sag: WEIGHT * settled(time) + RESTLESS.sag * shift + CROUCH * ready,
  };
}

function released(since) {
  const start = waiting(DROP.warn);
  const fade = Math.exp(-since / SPRING.decay);
  const phase = (TURN * since) / SPRING.period;

  return {
    sway: (start.sway * Math.cos(phase) + SPRING.whip * Math.sin(phase)) * fade,
    sag: start.sag * Math.cos(phase) * fade,
  };
}

// every drop moves its bough alike, and each frame plays it from the first tick, so each tick of
// it is worked out once; a raider is down and gone well before this many ticks
const KEPT_TICKS = 600;
const played = [];

const swayAt = (time) => (time < DROP.warn ? waiting(time) : released(time - DROP.warn));

// how far, in pixels, the trees right over a raider are moved `time` ticks into its drop: sideways
// and down, eased all the way, for the patch round it to share out by how much each part gives;
// still before it comes
export function boughSway(time) {
  if (time < 0) {
    return { sway: 0, sag: 0 };
  }

  if (!Number.isInteger(time) || time >= KEPT_TICKS) {
    return swayAt(time);
  }

  played[time] ??= swayAt(time);

  return played[time];
}
