import { AUDIO, CUE_RULES, DEFAULT_CUE_RULE, VOICE_CAP } from '../data/audio.js';
import { createVoice, holdAt, releaseVoice, SILENT } from './nodes.js';

export const ruleOf = (cue) => ({ ...DEFAULT_CUE_RULE, ...CUE_RULES[cue] });

export function pruneVoices(audio, now) {
  const playing = [];

  for (const voice of audio.voices) {
    if (voice.endsAt > now) {
      playing.push(voice);
    } else {
      releaseVoice(voice);
    }
  }

  audio.voices = playing;
}

// a stolen voice fades in a moment rather than clicking off
function silence(voice, now) {
  const level = voice.output.gain;

  holdAt(level, now);
  level.linearRampToValueAtTime(SILENT, now + AUDIO.stealSeconds);

  for (const source of voice.sources) {
    source.stop(now + AUDIO.stealSeconds + 0.01);
  }

  voice.endsAt = now + AUDIO.stealSeconds + 0.01;
}

function steal(audio, voice, now) {
  try {
    silence(voice, now);
  } catch {
    // a source that already ended needs no stopping
  }

  audio.voices = audio.voices.filter((each) => each !== voice);
}

// the lowest ranked voice, the oldest among equals
function weakest(voices) {
  return voices.reduce((low, voice) =>
    ruleOf(voice.cue).rank < ruleOf(low.cue).rank ? voice : low,
  );
}

// room for one more of `cue`: false when every voice playing outranks it
export function makeRoom(audio, cue, now) {
  const rule = ruleOf(cue);
  const same = audio.voices.filter((voice) => voice.cue === cue);

  if (same.length >= rule.cap) {
    steal(audio, same[0], now);
  }

  if (audio.voices.length < VOICE_CAP) {
    return true;
  }

  const victim = weakest(audio.voices);

  if (ruleOf(victim.cue).rank > rule.rank) {
    return false;
  }

  steal(audio, victim, now);

  return true;
}

export function openVoice(audio, cue) {
  const { context, chain } = audio;
  const output = context.createGain();
  const voice = createVoice({ context, chain, output });

  output.connect(chain[ruleOf(cue).bus]);
  voice.nodes.push(output);
  voice.cue = cue;

  return voice;
}
