import { NAGA_TIMINGS } from '../sequence.js';
import { KICK_SPOT } from '../world.js';
import { ballAt } from './ball.js';
import { easeIn, easeOut, lerp, phaseOf } from './ease.js';

// the great head rears behind Sochetra, over his shoulder, jaws toward the goal
export const MANIFEST = { x: KICK_SPOT.x - 6, y: KICK_SPOT.y - 96, size: 5.5, rise: 44 };

const HIDDEN = { shown: false };

// the eyes open in the dark behind him late in the charge, before anything else of it shows
function charge(clock) {
  const eyes = phaseOf(clock.share, 0.78, 0.22);

  if (eyes <= 0) {
    return HIDDEN;
  }

  return { ...rest(), shown: true, silhouette: 0, colour: 0, eyes, eyesOnly: true };
}

const rest = () => ({ x: MANIFEST.x, y: MANIFEST.y, size: MANIFEST.size, pulse: -1, compress: 0 });

// rising as a shadow, lit from within, its eyes igniting, then a pulse as it is whole
function manifest(clock) {
  const rise = easeOut(phaseOf(clock.share, 0, 0.35));
  const whole = 0.72;

  return {
    ...rest(),
    shown: true,
    y: MANIFEST.y + Math.round(MANIFEST.rise * (1 - rise)),
    silhouette: phaseOf(clock.share, 0, 0.12),
    colour: phaseOf(clock.share, 0.35, 0.25),
    eyes: phaseOf(clock.share, 0.58, 0.12),
    pulse: clock.share >= whole ? clock.ticks - Math.round(whole * clock.length) : -1,
    breath: clock.ticks,
  };
}

// it pours itself into the ball as the boot swings, gone into it at the contact
function impact(clock) {
  const pour = easeIn(phaseOf(clock.ticks, 0, NAGA_TIMINGS.contact));

  if (pour >= 1) {
    return HIDDEN;
  }

  const ball = ballAt(clock, 'goal');

  return {
    ...rest(),
    shown: true,
    silhouette: 1,
    colour: 1,
    eyes: 1,
    compress: pour,
    x: lerp(MANIFEST.x, ball.x - 10, pour),
    y: lerp(MANIFEST.y, ball.y, pour),
    size: lerp(MANIFEST.size, 1.2, pour),
  };
}

const BY_STAGE = { charge, manifest, impact };

// the summoned Naga behind the striker: where its head is, how big, and how far it has come
// into being (0 to 1 for its shadow, its colour and its eyes); after the kick it rides the ball
// instead (draw/projectile.js)
export const nagaAt = (clock) => BY_STAGE[clock.stage]?.(clock) ?? HIDDEN;
