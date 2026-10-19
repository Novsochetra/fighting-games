import { biquad, envelopeGain, oscillator } from '../live/nodes.js';
import { midiToFrequency } from './songs.js';

// step: { song, time, beat (seconds per step), position (0-15), chord, leadBar, bus, echo }

function bassSub(live, { start, frequency, beat, bus }) {
  const sub = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.01,
    peak: 0.16,
    decay: beat * 1.5,
  });
  oscillator(live, {
    wave: 'triangle',
    from: frequency / 2,
    start,
    duration: beat * 1.8,
    destination: sub,
  });
}

export function playBass(live, { song, time: start, beat, position, chord, bus }) {
  if (!song.bassSteps.includes(position)) {
    return;
  }
  const frequency = midiToFrequency(chord[0] - 24);
  const envelope = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.01,
    peak: 0.3,
    decay: beat * 1.6,
  });
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 900,
    to: 220,
    resonance: 3,
    start,
    duration: beat * 1.2,
    destination: envelope,
  });
  oscillator(live, {
    wave: 'sawtooth',
    from: frequency,
    start,
    duration: beat * 1.8,
    destination: lowpass,
  });
  bassSub(live, { start, frequency, beat, bus });
}

export function playArpeggio(live, { song, time: start, beat, position, chord, bus, echo }) {
  if (position % song.arpeggioEvery !== 0) {
    return;
  }
  const { arpeggio } = song;
  const note = chord[arpeggio[Math.floor(position / song.arpeggioEvery) % arpeggio.length]] + 12;
  const frequency = midiToFrequency(note);
  const envelope = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.004,
    peak: 0.06,
    decay: beat * 0.9,
  });
  envelope.connect(echo);
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: 2200,
    to: 1400,
    resonance: 0.7,
    start,
    duration: beat,
    destination: envelope,
  });
  oscillator(live, {
    wave: song.arpeggioWave,
    from: frequency,
    start,
    duration: beat,
    destination: lowpass,
  });
}

export function playPad(live, { song, time: start, beat, position, chord, bus }) {
  if (!song.padLevel || position !== 0) {
    return;
  }
  const duration = beat * 16;
  for (const note of chord) {
    const frequency = midiToFrequency(note);
    const peak = 0.028 * song.padLevel;
    const swell = { destination: bus, start, attack: 0.35, peak, decay: beat * 6, hold: beat * 9 };
    const envelope = envelopeGain(live, swell);
    const lowpass = biquad(live, {
      type: 'lowpass',
      from: 1100,
      to: 700,
      resonance: 0.7,
      start,
      duration,
      destination: envelope,
    });
    oscillator(live, { wave: 'sawtooth', from: frequency, start, duration, destination: lowpass });
    const detuned = frequency * 1.007;
    oscillator(live, { wave: 'sawtooth', from: detuned, start, duration, destination: lowpass });
  }
}
