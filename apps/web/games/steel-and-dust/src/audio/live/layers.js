import { biquad, envelopeGain, noise, oscillator, track } from './nodes.js';

// a pitched body that drops (kicks, thumps, punches)
export function thump(live, { start, from, to, duration, volume, bus }) {
  const destination = bus || live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.002,
    peak: volume,
    decay: duration,
  });
  const glide = duration * 0.6;
  oscillator(live, { wave: 'sine', from, to, start, duration, destination: envelope, glide });
}

// a filtered noise layer (whooshes, slices, dust)
export function hiss(live, { start, type, from, to, resonance, attack, duration, volume, bus }) {
  const destination = bus || live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack,
    peak: volume,
    decay: duration,
  });
  const length = attack + duration;
  const filter = biquad(live, {
    type,
    from,
    to,
    resonance,
    start,
    duration: length,
    destination: envelope,
  });
  noise(live, { start, duration: length, destination: filter });
}

// the very first milliseconds of a hit: a short bright tick
export function click(live, { start, volume, frequency }) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.0005,
    peak: volume,
    decay: 0.014,
  });
  const cutoff = frequency || 3000;
  const filter = biquad(live, {
    type: 'highpass',
    from: cutoff,
    to: cutoff,
    resonance: 0.7,
    start,
    duration: 0.02,
    destination: envelope,
  });
  noise(live, { start, duration: 0.02, destination: filter });
}

// metal: inharmonic partials with their own decays
export function metal(live, { start, frequencies, duration, volume, bus }) {
  frequencies.forEach((frequency, i) => {
    const envelope = envelopeGain(live, {
      destination: bus || live.chain.effectsBus,
      start,
      attack: 0.001,
      peak: volume / (1 + i * 0.6),
      decay: duration * (1 - i * 0.15),
    });
    const wave = i % 2 ? 'sine' : 'triangle';
    oscillator(live, {
      wave,
      from: frequency,
      to: frequency * 0.996,
      start,
      duration,
      destination: envelope,
    });
  });
}

// a gritty mid layer for chops, crates and KOs
export function crunch(live, { start, duration, volume, frequency }) {
  const shaper = track(live, live.context.createWaveShaper());
  shaper.curve = live.chain.crunchCurve;
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.003,
    peak: volume,
    decay: duration,
  });
  const darken = { type: 'lowpass', from: 3500, to: 900, resonance: 0.7 };
  shaper.connect(biquad(live, { ...darken, start, duration, destination: envelope }));
  const band = frequency || 900;
  const grit = { type: 'bandpass', from: band, to: band * 0.6, resonance: 1.1 };
  const filter = biquad(live, { ...grit, start, duration, destination: shaper });
  noise(live, { start, duration, destination: filter });
}

// a soft musical blip for menus and pickups
export function blip(live, { start, frequency, duration, volume, wave }) {
  const destination = live.chain.effectsBus;
  const envelope = envelopeGain(live, {
    destination,
    start,
    attack: 0.004,
    peak: volume,
    decay: duration,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: frequency * 3,
    to: frequency * 1.5,
    resonance: 0.7,
    start,
    duration,
    destination: envelope,
  });
  oscillator(live, {
    wave: wave || 'triangle',
    from: frequency,
    start,
    duration,
    destination: lowpass,
  });
}
