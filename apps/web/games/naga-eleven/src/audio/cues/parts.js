import { envelope, filter, gain, noise, strikes, tone } from '../nodes.js';

// the pieces cues are made of; each plays into the voice's output from `start` (context seconds)

export function thud(voice, { start, from, to, peak, decay, wave = 'sine' }) {
  const body = envelope(voice, { destination: voice.output, start, attack: 0.002, peak, decay });

  tone(voice, {
    wave,
    from,
    to,
    start,
    duration: decay + 0.05,
    glide: decay * 0.6,
    destination: body,
  });
}

// filtered noise; `sweep` is how long its filter takes to move from `from` to `to`
export function hiss(voice, options) {
  const { start, type = 'bandpass', from, to = from, resonance = 1, peak, buffer } = options;
  const { attack = 0.002, hold = 0, decay } = options;
  const length = attack + hold + decay;
  const shaped = envelope(voice, { destination: voice.output, start, attack, hold, peak, decay });
  const band = filter(voice, {
    type,
    from,
    to,
    resonance,
    start,
    duration: options.sweep ?? length,
    destination: shaped,
  });

  noise(voice, { buffer, start, duration: length + 0.02, destination: band });
}

export function ring(
  voice,
  { start, frequency, ratios = [1, 2.76, 5.4], peak, decay, wave = 'sine' },
) {
  const body = envelope(voice, { destination: voice.output, start, attack: 0.002, peak, decay });
  const upper = gain(voice, { destination: body, value: 0.35 });

  ratios.forEach((ratio, i) => {
    const destination = i === 0 ? body : upper;

    tone(voice, { wave, from: frequency * ratio, start, duration: decay + 0.05, destination });
  });
}

export function run(voice, { start, frequencies, gap, peak, decay, wave = 'triangle' }) {
  const times = frequencies.map((_, i) => start + i * gap);
  const end = times.at(-1) + decay;
  const struck = strikes(voice, { destination: voice.output, times, peak, decay });
  const oscillator = tone(voice, {
    wave,
    from: frequencies[0],
    start,
    duration: end - start + 0.05,
    destination: struck,
  });

  frequencies.forEach((frequency, i) => {
    if (i > 0) {
      oscillator.frequency.setValueAtTime(frequency, times[i]);
    }
  });
}

export function stab(voice, { start, frequencies, peak, decay }) {
  const body = envelope(voice, { destination: voice.output, start, attack: 0.004, peak, decay });
  const close = filter(voice, { from: 3200, to: 400, start, duration: decay, destination: body });

  for (const frequency of frequencies) {
    tone(voice, {
      wave: 'sawtooth',
      from: frequency,
      start,
      duration: decay + 0.05,
      destination: close,
    });
  }
}

export function glide(voice, { start, from, to, duration, peak, wave = 'sine' }) {
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: duration * 0.2,
    peak,
    decay: duration * 0.8,
  });

  tone(voice, { wave, from, to, start, duration: duration + 0.05, destination: body });
}
