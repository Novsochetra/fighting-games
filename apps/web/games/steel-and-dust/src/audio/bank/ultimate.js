import { clamp } from '../../lib/math.js';
import { expCurve } from '../synth/curves.js';
import { pulses } from '../synth/envelopes.js';
import { boom, burst, crack, rumble } from '../synth/impacts.js';
import { layer } from '../synth/layer.js';
import { signal } from '../synth/signal.js';
import { ringModSource, sawStackSource } from '../synth/sources.js';
import { shing, steel } from '../synth/steel.js';
import { crackle } from '../synth/texture.js';
import { CLASH } from './steel-modes.js';

const STABS = [0, 0.1, 0.19, 0.27];
const STAB_RISE = 1.13;
const RING_AT = 0.36;
const DRONE_SECONDS = 1;
const TREMBLE_HZ = 14;

// one harsh electric stab: a gated ring-modulated buzz with a crack on its front
function stab(track, { start, rise, level }) {
  signal(track, {
    start,
    length: 0.08,
    source: ringModSource({ carrier: 620 * rise, modulator: 233 * rise }),
    filter: 'bandpass',
    cutoff: 2200 * rise,
    resonance: 1.2,
    envelope: pulses([[0, 0.001, 0.028, 0.03]]),
    level,
    drive: 2.5,
  });
  crack(track, { start, level: 0.5 });
  layer(track, {
    filter: 'highpass',
    cutoff: 5000,
    attack: 0.0005,
    decay: 0.03,
    level: 0.4,
    start,
  });
}

function jiing(track, pitch) {
  const index = expCurve([0, 5, 0.6, 0.6]);
  crack(track, { start: RING_AT, level: 0.9 });
  shing(track, {
    start: RING_AT,
    carrier: 1480 * pitch,
    ratio: 1.4,
    index,
    decay: 0.65,
    level: 0.55,
  });
  steel(track, { start: RING_AT, base: 2200 * pitch, ratios: CLASH, decay: 0.7, level: 0.3 });
  boom(track, { start: RING_AT, from: 90, to: 35, decay: 0.4, level: 0.9 });
}

// a low tritone that trembles under it all, which is what makes it menacing
function dreadDrone(track) {
  const tremble = (time) => 0.6 + 0.4 * Math.sin(2 * Math.PI * TREMBLE_HZ * time);
  const swell = (time) => Math.min(1, time / 0.35) * clamp((DRONE_SECONDS - time) / 0.15, 0, 1);
  signal(track, {
    source: sawStackSource({ frequencies: [55, 77.8], detune: 0.01 }),
    filter: 'lowpass',
    cutoff: expCurve([0, 250, 0.9, 900]),
    resonance: 2,
    envelope: (time) => swell(time) * tremble(time),
    length: DRONE_SECONDS,
    level: 0.32,
    drive: 2,
  });
}

// the cut-in: three stabs climbing in pitch ("jib, jib, jib"), then a ringing JIIING, all before
// the 46-tick freeze ends
function buildUlt(track, pitch) {
  STABS.forEach((start, i) => {
    stab(track, { start, rise: pitch * Math.pow(STAB_RISE, i), level: 0.9 + i * 0.12 });
  });
  jiing(track, pitch);
  dreadDrone(track);
  return { drive: 1.8, crush: { rate: 22050, bits: 9 } };
}

// the finish: a blast crack, a falling sub boom, debris and a long rolling rumble
function buildUltEnd(track, pitch) {
  crack(track, { level: 1.3, width: 0.003 });
  burst(track, { filter: 'highpass', from: 1500, decay: 0.05, level: 1.5 });
  boom(track, { from: 95 * pitch, to: 24, glideTime: 0.5, decay: 1, level: 1.6, drive: 2.4 });
  rumble(track, { length: 1.4, from: 2400, to: 70, level: 3, rolls: 6 });
  burst(track, { from: 1400, to: 350, time: 0.3, decay: 0.3, level: 1.5, drive: 4 });
  crackle(track, { start: 0.04, length: 0.7, count: 30, cutoff: 2500, level: 0.35 });
  return { drive: 2.6 };
}

// built ahead into the bank like the hits: modal steel and a ring-modulated stutter cost far too
// many live nodes to build on the spot
export const ULTIMATE_SOUNDS = {
  ult: { group: 'ult', level: 0.44, takes: 1, seconds: 1.05, priority: 3, build: buildUlt },
  ultEnd: { group: 'ult', level: 0.95, takes: 1, seconds: 1.6, priority: 3, build: buildUltEnd },
};
