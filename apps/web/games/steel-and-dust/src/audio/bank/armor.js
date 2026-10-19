import { layer } from '../synth/layer.js';
import { ring } from '../synth/struck.js';

const CLANG = {
  strike: { milliseconds: 2, lowpass: 8000, click: 1 },
  modes: [
    [1240, 0.5, 1],
    [1830, 0.4, 0.7],
    [2610, 0.32, 0.5],
    [3170, 0.26, 0.4],
    [4110, 0.2, 0.3],
    [5230, 0.15, 0.2],
  ],
};
const THUD = {
  strike: { milliseconds: 4, lowpass: 1200, click: 0.5 },
  modes: [
    [210, 0.06, 0.6],
    [330, 0.04, 0.4],
  ],
};

// a shield block or an armour clang; the thud behind it keeps its pitch
function buildArmor(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 3000, attack: 0.0003, decay: 0.012, level: 0.55 });
  ring(track, CLANG, pitch);
  ring(track, THUD, 1);
  return { drive: 1.5 };
}

export const ARMOR_SOUNDS = {
  armor: { group: 'hit', level: 0.5, takes: 3, seconds: 0.6, priority: 2, build: buildArmor },
};
