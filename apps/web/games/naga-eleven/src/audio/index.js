import { pauseAudio, resumeAudio, unlockAudio } from './context/unlock.js';
import { setVolumes } from './context/volumes.js';
import { setCrowdLevel } from './crowd/bed.js';
import { hearMatch } from './hear/hear-match.js';
import { hearTraining } from './hear/hear-training.js';
import { setMood } from './music/player.js';
import { playCue } from './play.js';
import { createAudioState } from './state.js';

export { installAudioUnlock } from './context/unlock-listeners.js';
export { CUE_NAMES } from './cues/index.js';
export { THEME_IDS } from '../data/music/index.js';

function statsOf(audio) {
  return {
    state: audio.context?.state ?? 'none',
    voices: audio.voices.length,
    mood: audio.music.playing?.id ?? null,
  };
}

// The game's sound, all of it synthesized. `AudioContext` is the browser's class (or nothing, for
// a silent game); every call is safe before unlock(), without Web Audio and while suspended.
// Volumes and the crowd are shares, 0 to 1.
export function createAudio(options = {}) {
  const audio = createAudioState(options);

  return {
    unlock: () => unlockAudio(audio),
    play: (cue, cueOptions) => playCue(audio, cue, cueOptions),
    hear: (events, match) => hearMatch(audio, events, match),
    hearTraining: (state) => hearTraining(audio, state),
    setMusic: (mood) => setMood(audio, mood),
    setVolumes: (volumes) => setVolumes(audio, volumes),
    setCrowd: (level) => setCrowdLevel(audio, level),
    pause: () => pauseAudio(audio),
    resume: () => resumeAudio(audio),
    stats: () => statsOf(audio),
  };
}
