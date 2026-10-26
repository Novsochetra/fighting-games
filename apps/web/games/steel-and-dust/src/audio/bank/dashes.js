import { glide } from '../synth/curves.js';
import { hush, rush } from '../synth/air.js';
import { layer } from '../synth/layer.js';

function whomp(track, { from, to, seconds, attack, decay, level }) {
  layer(track, { wave: 'sine', frequency: glide(from, seconds, to), attack, decay, level });
}

// the feet push off padded, a thump and a breath of dust: a scuff with grit or crackle in it
// makes the dash sound rough
function pushOff(track, pitch) {
  whomp(track, {
    from: 110 * pitch,
    to: 50,
    seconds: 0.07,
    attack: 0.002,
    decay: 0.08,
    level: 0.48,
  });
  const dust = glide(1400, 0.06, 300);
  layer(track, { filter: 'lowpass', cutoff: dust, attack: 0.003, decay: 0.06, level: 0.72 });
}

// two bands of air crossing as they pass, like a phaser, over a dark rush and a low whomp. Every
// part eases in and out and nothing flutters, and the hiss is rolled off the top: a click, a
// flutter (heard as a rattle) or hiss is what makes a dash sound rough
function swirl(track, pitch) {
  const passing = { length: 0.3, peak: 0.08, resonance: 1.6 };
  rush(track, { ...passing, from: 450 * pitch, top: 2000 * pitch, to: 650 * pitch, level: 0.7 });
  rush(track, { ...passing, from: 2100 * pitch, top: 600 * pitch, to: 1400 * pitch, level: 0.55 });
  const body = { length: 0.26, peak: 0.06, level: 0.5 };
  hush(track, { ...body, from: 400 * pitch, top: 1500 * pitch, to: 500 * pitch });
  whomp(track, { from: 100 * pitch, to: 55, seconds: 0.1, attack: 0.01, decay: 0.1, level: 0.3 });
  return { lowpass: 3800 };
}

function buildDash(track, pitch) {
  pushOff(track, pitch);
  return swirl(track, pitch);
}

// the air dash has no feet in it
const buildDashAir = (track, pitch) => swirl(track, pitch);

export const DASH_SOUNDS = {
  dash: { group: 'movement', level: 0.32, takes: 4, seconds: 0.34, priority: 1, build: buildDash },
  dashAir: {
    group: 'movement',
    level: 0.38,
    takes: 4,
    seconds: 0.34,
    priority: 1,
    build: buildDashAir,
  },
};
