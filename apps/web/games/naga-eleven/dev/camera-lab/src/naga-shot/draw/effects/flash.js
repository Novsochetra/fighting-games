import { SHOT_ART } from '../../colors.js';
import { VIEW } from '../../world.js';
import { sinceCrash, sinceHit } from './beats.js';

// a whole-screen wash in a few fixed steps, as a 16-bit game flashes its palette, never a fade
const HIT_FLASH = [
  { color: SHOT_ART.white, alpha: 0.9 },
  { color: SHOT_ART.white, alpha: 0.75 },
  { color: SHOT_ART.gold[3], alpha: 0.55 },
  { color: SHOT_ART.gold[2], alpha: 0.35 },
];

const held = (ticks, flash) => Array.from({ length: ticks }, () => flash);

// the Naga's light floods the screen at the crash and ebbs a step at a time through the hold
const CRASH_FLASH = [
  { color: SHOT_ART.white, alpha: 0.95 },
  { color: SHOT_ART.white, alpha: 0.8 },
  { color: SHOT_ART.white, alpha: 0.6 },
  ...held(2, { color: SHOT_ART.emerald[4], alpha: 0.5 }),
  ...held(3, { color: SHOT_ART.emerald[3], alpha: 0.35 }),
  ...held(3, { color: SHOT_ART.emerald[2], alpha: 0.25 }),
  ...held(3, { color: SHOT_ART.emerald[1], alpha: 0.15 }),
];

const PULSE_FLASH = [
  { color: SHOT_ART.white, alpha: 0.45 },
  { color: SHOT_ART.emerald[4], alpha: 0.3 },
  { color: SHOT_ART.emerald[3], alpha: 0.15 },
];

const FLASHES = {
  manifest: ({ naga }) => PULSE_FLASH[naga.pulse],
  impact: ({ clock }) => HIT_FLASH[sinceHit(clock)],
  collision: ({ clock }) => CRASH_FLASH[sinceCrash(clock)],
};

export function drawScreenFlash(context, moment) {
  const flash = FLASHES[moment.clock.stage]?.(moment);

  if (!flash) {
    return;
  }

  context.save();
  context.globalAlpha *= flash.alpha;
  context.fillStyle = flash.color;
  context.fillRect(0, 0, VIEW.width, VIEW.height);
  context.restore();
}
