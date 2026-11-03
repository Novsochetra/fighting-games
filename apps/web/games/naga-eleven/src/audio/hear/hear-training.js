import { playCue } from '../play.js';
import { isRunning } from '../state.js';
import { trainingCues } from './training-cues.js';

// once a tick of a drill, after updateDrill; returns the cues it heard
export function hearTraining(audio, state) {
  if (!state) {
    return [];
  }

  const cues = trainingCues(state, audio.trainingEar);

  if (isRunning(audio)) {
    for (const { cue, options } of cues) {
      playCue(audio, cue, options);
    }
  }

  return cues;
}
