import { NOISE_SECONDS } from './rig.js';

// an exponential fade cannot reach zero; this is 60 dB down, too quiet to click when the voice stops
const SILENT = 0.001;
const STOP_AFTER = 0.02;

function oscillator(context, voice, from) {
  const node = context.createOscillator();

  node.type = voice.wave;
  node.frequency.setValueAtTime(voice.freq, from);

  if (voice.to) {
    node.frequency.exponentialRampToValueAtTime(voice.to, from + voice.slide);
  }

  return node;
}

function noiseBurst(rig) {
  const node = rig.context.createBufferSource();

  node.buffer = rig.noise;

  return node;
}

function filterFor(context, filter) {
  const node = context.createBiquadFilter();

  node.type = filter.type;
  node.frequency.value = filter.freq;

  if (filter.q) {
    node.Q.value = filter.q;
  }

  return node;
}

function envelope(context, voice, from) {
  const node = context.createGain();
  const loudest = from + voice.attack;

  node.gain.setValueAtTime(0, from);
  node.gain.linearRampToValueAtTime(voice.gain, loudest);
  node.gain.setValueAtTime(voice.gain, loudest + voice.hold);
  node.gain.exponentialRampToValueAtTime(SILENT, loudest + voice.hold + voice.decay);

  return node;
}

function wire(nodes) {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }
}

function start(source, voice, from) {
  if (voice.wave === 'noise') {
    // each burst reads its own stretch of the one buffer, or three flicks are one flick three times
    source.start(from, (Math.random() * NOISE_SECONDS) / 2);
  } else {
    source.start(from);
  }
}

export function playVoice(rig, voice, startsAt) {
  const { context } = rig;
  const from = startsAt + voice.at;
  const source = voice.wave === 'noise' ? noiseBurst(rig) : oscillator(context, voice, from);
  const shaped = voice.filter ? [filterFor(context, voice.filter)] : [];

  wire([source, ...shaped, envelope(context, voice, from), rig.out]);
  start(source, voice, from);
  source.stop(from + voice.attack + voice.hold + voice.decay + STOP_AFTER);
}
