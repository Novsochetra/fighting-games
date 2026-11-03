import { filter, gain, noise, SILENT, tone, wobble } from '../nodes.js';

// [from, length] of each blast, in seconds from the start
const BLASTS = {
  short: [[0, 0.22]],
  restart: [[0, 0.14]],
  long: [[0, 1.1]],
  final: [
    [0, 0.32],
    [0.48, 0.32],
    [0.96, 1],
  ],
};

const LEVELS = { restart: 0.6 };

function blowing(voice, { start, blasts, peak }) {
  const node = voice.context.createGain();

  voice.nodes.push(node);

  for (const [from, length] of blasts) {
    node.gain.setValueAtTime(SILENT, start + from);
    node.gain.linearRampToValueAtTime(peak, start + from + 0.012);
    node.gain.setValueAtTime(peak, start + from + length - 0.04);
    node.gain.exponentialRampToValueAtTime(SILENT, start + from + length);
  }

  node.connect(voice.output);

  return node;
}

// a pea whistle: the pea's rattle trills the pitch, and breath hisses under it
function whistle(voice, { start, kind = 'short', level = 1 }) {
  const blasts = BLASTS[kind] ?? BLASTS.short;
  const [from, length] = blasts.at(-1);
  const duration = from + length + 0.05;
  const body = blowing(voice, { start, blasts, peak: 0.16 * level * (LEVELS[kind] ?? 1) });
  const pea = tone(voice, { from: 2950, start, duration, destination: body });
  const breath = gain(voice, { destination: body, value: 0.35 });
  const band = filter(voice, {
    type: 'bandpass',
    from: 3300,
    resonance: 1.4,
    start,
    duration,
    destination: breath,
  });

  wobble(voice, { param: pea.frequency, rate: 34, depth: 120, start, duration });
  noise(voice, { start, duration, destination: band });
}

export const WHISTLE_CUES = { whistle };
