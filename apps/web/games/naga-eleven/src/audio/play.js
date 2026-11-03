import { AUDIO } from '../data/audio.js';
import { CUES } from './cues/index.js';
import { releaseVoice } from './nodes.js';
import { isRunning, nowOf } from './state.js';
import { makeRoom, openVoice, pruneVoices } from './voices.js';

function isMerged(audio, cue, now) {
  return now - (audio.lastStarts[cue] ?? -Infinity) < AUDIO.mergeSeconds;
}

function build(audio, cue, options) {
  const now = nowOf(audio);
  const voice = openVoice(audio, cue);

  try {
    CUES[cue](voice, { ...options, start: now + AUDIO.startDelay });
  } catch {
    // a node the browser refuses must never stop the game
    releaseVoice(voice);

    return false;
  }

  audio.voices.push(voice);
  audio.lastStarts[cue] = now;

  return true;
}

export function playCue(audio, cue, options = {}) {
  if (!CUES[cue] || !isRunning(audio)) {
    return false;
  }

  const now = nowOf(audio);

  pruneVoices(audio, now);

  if (isMerged(audio, cue, now) || !makeRoom(audio, cue, now)) {
    return false;
  }

  return build(audio, cue, options);
}
