import { MASTER_GAIN } from '../data/sounds.js';

export const NOISE_SECONDS = 1;

function noiseBuffer(context) {
  const length = Math.floor(context.sampleRate * NOISE_SECONDS);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    samples[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function playThroughTheSilentSwitch(navigator) {
  try {
    if (navigator && navigator.audioSession) {
      navigator.audioSession.type = 'playback';
    }
  } catch {
    // older WebKit has an audioSession that cannot be set; the sound still plays with the switch on
  }
}

function build(Context) {
  const context = new Context();
  const out = context.createGain();

  out.gain.value = MASTER_GAIN;
  out.connect(context.destination);

  return { context, out, noise: noiseBuffer(context), hasRun: false };
}

export function openRig(window) {
  const Context = window.AudioContext || window.webkitAudioContext;

  if (!Context) {
    return null;
  }

  playThroughTheSilentSwitch(window.navigator);

  try {
    return build(Context);
  } catch {
    // a browser out of audio hardware refuses a context: the game plays on in silence
    return null;
  }
}
