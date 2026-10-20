import { biquad, envelopeGain, oscillator, track } from '../live/nodes.js';
import { midiToFrequency } from './songs.js';

function vibrato(live, { target, frequency, start, length }) {
  const lfo = track(live, live.context.createOscillator(), { source: true });
  const depth = track(live, live.context.createGain());
  lfo.frequency.value = 5.5;
  depth.gain.value = frequency * 0.006;
  lfo.connect(depth);
  depth.connect(target.frequency);
  lfo.start(start);
  lfo.stop(start + length + 0.05);
}

export function playLead(live, { song, time: start, beat, position, leadBar, bus, echo }) {
  const note = song.lead[position];
  if (!note || !leadBar) {
    return;
  }
  const frequency = midiToFrequency(note);
  const length = beat * song.leadLength;
  const envelope = envelopeGain(live, {
    destination: bus,
    start,
    attack: 0.01,
    peak: song.leadLevel,
    decay: length,
  });
  envelope.connect(echo);
  const lowpass = biquad(live, {
    type: 'lowpass',
    from: song.leadCutoff,
    to: 1500,
    resonance: 0.8,
    start,
    duration: length,
    destination: envelope,
  });
  const voice = {
    wave: song.leadWave,
    from: frequency,
    start,
    duration: length,
    destination: lowpass,
  };
  const target = oscillator(live, voice);
  vibrato(live, { target, frequency, start, length });
}
