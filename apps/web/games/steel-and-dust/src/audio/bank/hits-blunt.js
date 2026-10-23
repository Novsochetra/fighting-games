import { boom, burst, crack, rumble } from '../synth/impacts.js';
import { crackle } from '../synth/texture.js';

// a punch: a crack, a "pak" near 1.5 kHz and a "thwack" near 400 Hz (phone speakers play both), and
// a body that drops under them
function buildBlunt(track, pitch) {
  crack(track, { level: 0.8, width: 0.0015 });
  burst(track, {
    from: 1900 * pitch,
    to: 950 * pitch,
    time: 0.03,
    resonance: 1.2,
    decay: 0.035,
    level: 2.6,
    drive: 3,
  });
  burst(track, {
    from: 520 * pitch,
    to: 260,
    time: 0.06,
    resonance: 1.3,
    decay: 0.08,
    level: 4,
    drive: 2.5,
  });
  boom(track, { from: 165 * pitch, to: 48, glideTime: 0.09, decay: 0.2, level: 1.5, drive: 2 });
  return { drive: 3.2, lowpass: 9000 };
}

// a heavy punch, "DOOM": the crack, crunching bone and a low body that rumbles on
function buildBluntBig(track, pitch) {
  crack(track, { level: 1, width: 0.002 });
  burst(track, { from: 1500 * pitch, to: 700 * pitch, decay: 0.05, level: 2.4, drive: 3.5 });
  burst(track, { from: 380 * pitch, to: 170, resonance: 1.2, decay: 0.12, level: 4.5, drive: 3 });
  boom(track, { from: 125 * pitch, to: 34, decay: 0.42, level: 1.8, drive: 2.4 });
  rumble(track, { length: 0.35, from: 1400, to: 90, level: 2.2, rolls: 2 });
  crackle(track, { start: 0, length: 0.05, count: 8, cutoff: 2000, level: 0.4 });
  return { drive: 3.4, crush: { rate: 22050, bits: 10 } };
}

export const BLUNT_SOUNDS = {
  blunt: { group: 'hit', level: 1, takes: 4, seconds: 0.35, priority: 2, build: buildBlunt },
  bluntBig: {
    group: 'hit',
    level: 1.3,
    takes: 4,
    seconds: 0.6,
    priority: 2,
    build: buildBluntBig,
  },
};
