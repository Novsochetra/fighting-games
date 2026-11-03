import { CROWD_CUE_NAMES } from '../cues/index.js';
import { updateBed } from '../crowd/bed.js';
import { duckMusic } from '../music/duck.js';
import { playCue } from '../play.js';
import { isRunning } from '../state.js';
import { excitementOf } from './crowd-mood.js';
import { matchCues } from './match-cues.js';

const CROWD_CUES = new Set(CROWD_CUE_NAMES);

// the crowd's cheers and groans are as big as the crowd; an empty field makes none
function playHeard(audio, { cue, options, duck }) {
  const crowd = CROWD_CUES.has(cue);

  if (!crowd || audio.crowdLevel > 0) {
    const level = crowd ? (options.level ?? 1) * audio.crowdLevel : options.level;

    playCue(audio, cue, { ...options, level });
  }

  if (duck) {
    duckMusic(audio, duck);
  }
}

// once a tick of a match, with the events drained that tick; returns the cues it heard
export function hearMatch(audio, events, match) {
  if (!match?.ball || !match.pitch || !match.goal || !Array.isArray(match.players)) {
    return [];
  }

  const cues = matchCues(Array.isArray(events) ? events : [], match, audio.ear);

  audio.excitement = excitementOf(match);
  updateBed(audio);

  if (isRunning(audio)) {
    for (const heard of cues) {
      playHeard(audio, heard);
    }
  }

  return cues;
}
