import { ANGKOR_HEAVY_SOUNDS } from './angkor.js';
import { ANTLER_HEAVY_SOUNDS } from './antler.js';
import { BLUE_HEAVY_SOUNDS } from './blue.js';
import { BOKATOR_HEAVY_SOUNDS } from './bokator.js';
import { EMBER_HEAVY_SOUNDS } from './ember.js';
import { FIREFLY_HEAVY_SOUNDS } from './firefly.js';
import { MOSS_HEAVY_SOUNDS } from './moss.js';
import { track } from '../nodes.js';
import { heavyEmpty } from './shared.js';

// the Shades' sounds are built at the level of the event sounds, which have the field to themselves;
// a heavy's charge plays under its own swing and the music and was lost there, so they go out
// louder, the charge most of all (about 12 dB), its quieter release and the fizzle less
const CHARGE_GAIN = 4;
const OTHER_GAIN = 2.5;

function louder(sound, gain) {
  return (live, start) => {
    const boost = track(live, live.context.createGain());
    boost.gain.value = gain;
    boost.connect(live.chain.effectsBus);
    sound({ ...live, chain: { ...live.chain, effectsBus: boost } }, start);
  };
}

const SOUNDS = {
  heavyEmpty,
  ...MOSS_HEAVY_SOUNDS,
  ...FIREFLY_HEAVY_SOUNDS,
  ...ANTLER_HEAVY_SOUNDS,
  ...BLUE_HEAVY_SOUNDS,
  ...EMBER_HEAVY_SOUNDS,
  ...BOKATOR_HEAVY_SOUNDS,
  ...ANGKOR_HEAVY_SOUNDS,
};

// each Shade's heavy charge (and release, where it has one), and the fizzle of a heavy with no bar
export const HEAVY_SOUNDS = Object.fromEntries(
  Object.entries(SOUNDS).map(([key, sound]) => [
    key,
    louder(sound, key.endsWith('Charge') ? CHARGE_GAIN : OTHER_GAIN),
  ]),
);
