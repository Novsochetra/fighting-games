import { hertz } from './notes.js';

const SILENT = 0.0001;
const TAIL = 0.03;

export function playVoice(context, output, voice, { at, transpose = 0 }) {
  const start = at + voice.at;
  const end = start + voice.length;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = voice.wave;
  oscillator.frequency.setValueAtTime(hertz(voice.note + transpose), start);

  if (voice.slideTo !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(hertz(voice.slideTo + transpose), end);
  }

  gain.gain.setValueAtTime(voice.volume, start);
  gain.gain.exponentialRampToValueAtTime(SILENT, end);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(end + TAIL);
}
