import { jawsOffset } from '../../../../../src/render/duel/looks/naga-head.js';
import { NAGA_TIMINGS } from '../sequence.js';
import { GROUND, KICK_SPOT } from '../world.js';
import { ballAt } from './ball.js';
import { bezier, easeIn, easeOut, lerp, phaseOf } from './ease.js';

export const MANIFEST = { x: KICK_SPOT.x - 28, y: GROUND - 91, size: 3.4, rise: 64 };

// the charge's close view on the ball shows only a strip at his height, so the eyes open there,
// low in the dark behind him
export const LURK = { x: KICK_SPOT.x - 33, y: GROUND - 47 };

// in shares of the stage: the rise, the colour coming in, the eyes catching fire, whole
const BEATS = {
  rise: [0, 0.4],
  silhouette: [0, 0.14],
  colour: [0.34, 0.24],
  eyes: [0.6, 0.08],
  whole: 0.72,
  lurk: [0.74, 0.2],
};

// it swings out past his head, so it comes down on the ball in the open, jaws first
const POURED = { size: 0.6, swing: { x: 34, y: 10 } };

const HIDDEN = { shown: false };

function since(clock, share) {
  const at = Math.round(share * clock.length);

  return clock.ticks >= at ? clock.ticks - at : -1;
}

const rest = () => ({ x: MANIFEST.x, y: MANIFEST.y, size: MANIFEST.size, pulse: -1, compress: 0 });

function charge(clock) {
  const eyes = phaseOf(clock.share, ...BEATS.lurk);

  if (eyes <= 0) {
    return HIDDEN;
  }

  const lit = since(clock, BEATS.lurk[0] + BEATS.lurk[1]);

  return { ...rest(), ...LURK, shown: true, silhouette: 0, colour: 0, eyes, lit, eyesOnly: true };
}

function manifest(clock) {
  const rise = easeOut(phaseOf(clock.share, ...BEATS.rise));

  return {
    ...rest(),
    shown: true,
    y: MANIFEST.y + Math.round(MANIFEST.rise * (1 - rise)),
    silhouette: phaseOf(clock.share, ...BEATS.silhouette),
    colour: phaseOf(clock.share, ...BEATS.colour),
    eyes: phaseOf(clock.share, ...BEATS.eyes),
    lit: since(clock, BEATS.eyes[0] + BEATS.eyes[1]),
    pulse: since(clock, BEATS.whole),
    breath: clock.ticks,
  };
}

// its timers run on into the kick, so its flames and glint carry on through the cut
function carriedOn(clock) {
  const length = clock.lengths.manifest;
  const after = (share) => length - Math.round(share * length) + clock.ticks;

  return {
    pulse: after(BEATS.whole),
    lit: after(BEATS.eyes[0] + BEATS.eyes[1]),
    breath: length + clock.ticks,
  };
}

function impact(clock) {
  const pour = easeIn(phaseOf(clock.ticks, 0, NAGA_TIMINGS.contact));

  if (pour >= 1) {
    return HIDDEN;
  }

  const ball = ballAt(clock, 'goal');
  const size = lerp(MANIFEST.size, POURED.size, Math.sqrt(pour));
  const path = bezier(
    MANIFEST,
    { x: ball.x + POURED.swing.x, y: MANIFEST.y + POURED.swing.y },
    ball,
    pour,
  );
  const jaws = jawsOffset({ size });

  return {
    ...rest(),
    shown: true,
    silhouette: 1,
    colour: 1,
    eyes: 1,
    compress: pour,
    x: path.x - jaws.x * pour,
    y: path.y - jaws.y * pour,
    size,
    ball,
    ...carriedOn(clock),
  };
}

const BY_STAGE = { charge, manifest, impact };

// after the kick the Naga rides the ball instead (draw/projectile.js)
export const nagaAt = (clock) => BY_STAGE[clock.stage]?.(clock) ?? HIDDEN;
