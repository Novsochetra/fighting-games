import { SPECIAL_LOOKS } from './looks.js';
import { glide, hiss, ring, run, thud } from './parts.js';

const LAYERS = {
  boom(voice, start, { from, to, decay, peak }) {
    thud(voice, { start, from, to, peak, decay });
    hiss(voice, {
      start,
      type: 'lowpass',
      from: 500,
      to: 120,
      peak: peak * 0.5,
      decay: decay * 0.6,
    });
  },

  // a gong's partials sit off the harmonic series, and its two lowest beat slowly against each other
  gong(voice, start, { frequency, decay, peak }) {
    ring(voice, { start, frequency, ratios: [1, 1.004, 2.76, 5.4], peak, decay });
  },

  wash(voice, start, { from, to, duration, resonance, peak }) {
    hiss(voice, {
      start,
      from,
      to,
      resonance,
      peak,
      attack: duration * 0.3,
      decay: duration * 0.7,
    });
  },

  flurry(voice, start, { count, gap, frequency, notes, peak, wave = 'sine' }) {
    const frequencies = notes ?? Array.from({ length: count }, () => frequency);

    run(voice, { start, frequencies, gap, peak, decay: gap * 1.5, wave });
  },

  ring(voice, start, { frequency, decay, peak, wave }) {
    ring(voice, { start, frequency, ratios: [1, 2.01, 3.03], peak, decay, wave });
  },

  glide(voice, start, { from, to, duration, peak, wave }) {
    glide(voice, { start, from, to, duration, peak, wave });
  },
};

// a special landing, in the colour of its move's look (src/data/moves.js)
function impact(voice, { start, look = 'plain' }) {
  const { layers } = SPECIAL_LOOKS[look] ?? SPECIAL_LOOKS.plain;

  for (const layer of layers) {
    LAYERS[layer.kind](voice, start + (layer.at ?? 0), layer);
  }
}

export const LAYER_KINDS = Object.keys(LAYERS);

export const IMPACT_CUES = { impact };
