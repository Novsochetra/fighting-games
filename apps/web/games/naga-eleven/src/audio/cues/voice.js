import { VOICES } from '../../data/audio.js';
import { envelope, filter, tone } from '../nodes.js';

// a speaker's pitch: their own, higher when young; `child` marks a child with no age of their own
export function voicePitch({ speaker, age, child = false }) {
  const base = VOICES.speakers[speaker] ?? VOICES.base;

  return base * (VOICES.ages[age] ?? 1) * (child ? VOICES.child : 1);
}

// a letter of a line: a soft tick at the speaker's pitch, a hair off each time so a line never drones
function blip(voice, { start, speaker, age, child }) {
  const pitch = voicePitch({ speaker, age, child }) * (0.97 + Math.random() * 0.06);
  const body = envelope(voice, {
    destination: voice.output,
    start,
    attack: 0.003,
    peak: 0.12,
    decay: 0.035,
  });
  const soft = filter(voice, { from: 2400, start, duration: 0.06, destination: body });

  tone(voice, { wave: 'square', from: pitch, start, duration: 0.05, destination: soft });
}

export const VOICE_CUES = { blip };
