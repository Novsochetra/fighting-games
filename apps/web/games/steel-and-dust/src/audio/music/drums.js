import { biquad, envelopeGain, noise, oscillator } from '../live/nodes.js';

function noiseHit(live, { start, bus, filter, envelope, duration }) {
  const gain = envelopeGain(live, { destination: bus, start, ...envelope });
  const shaped = biquad(live, { ...filter, start, duration, destination: gain });
  noise(live, { start, duration, destination: shaped });
}

export function playKick(live, { song, time: start, position, bus }) {
  if (!song.kickSteps.includes(position)) {
    return;
  }
  const body = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.002,
    peak: 0.62,
    decay: 0.15,
  });
  oscillator(live, {
    wave: 'sine',
    from: 150,
    to: 46,
    start,
    duration: 0.16,
    destination: body,
    glide: 0.09,
  });
  const filter = { type: 'highpass', from: 2500, to: 2500, resonance: 0.7 };
  noiseHit(live, {
    start,
    bus,
    filter,
    envelope: { attack: 0.0005, peak: 0.12, decay: 0.008 },
    duration: 0.01,
  });
}

export function playSnare(live, { song, time: start, position, bus }) {
  if (!song.snareSteps.includes(position)) {
    return;
  }
  const filter = { type: 'bandpass', from: 1900, to: 1500, resonance: 0.8 };
  noiseHit(live, {
    start,
    bus,
    filter,
    envelope: { attack: 0.002, peak: 0.22, decay: 0.12 },
    duration: 0.14,
  });
  const body = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.002,
    peak: 0.12,
    decay: 0.07,
  });
  oscillator(live, {
    wave: 'triangle',
    from: 200,
    to: 160,
    start,
    duration: 0.07,
    destination: body,
  });
}

export function playHat(live, { song, time: start, position, bus }) {
  const open = song.openHatSteps.includes(position);
  if (!open && !(song.closedHats && position % 2 === 0)) {
    return;
  }
  const filter = { type: 'highpass', from: 8500, to: 8500, resonance: 0.7 };
  const envelope = { attack: 0.001, peak: open ? 0.05 : 0.025, decay: open ? 0.06 : 0.02 };
  noiseHit(live, { start, bus, filter, envelope, duration: 0.04 });
}
