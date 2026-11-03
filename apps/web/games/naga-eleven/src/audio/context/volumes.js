import { AUDIO } from '../../data/audio.js';

const RAMP = 0.015;

const clampShare = (value) => Math.min(1, Math.max(0, value));

// a slider feels even when the gain follows its square: halfway sounds about half as loud
export const loudness = (share) => clampShare(share) ** 2;

export const busLevels = ({ sound, music }) => ({
  effects: AUDIO.levels.effects * loudness(sound),
  music: AUDIO.levels.music * loudness(music),
});

// only the volumes given change; one that is not a number is left as it was
export function mergeVolumes(current, wanted = {}) {
  const next = { ...current };

  for (const key of ['sound', 'music']) {
    if (Number.isFinite(wanted[key])) {
      next[key] = clampShare(wanted[key]);
    }
  }

  return next;
}

export function applyVolumes(audio) {
  if (!audio.chain) {
    return;
  }

  const levels = busLevels(audio.volumes);
  const now = audio.context.currentTime;

  audio.chain.effects.gain.setTargetAtTime(levels.effects, now, RAMP);
  audio.chain.music.gain.setTargetAtTime(levels.music, now, RAMP);
}

export function setVolumes(audio, wanted) {
  audio.volumes = mergeVolumes(audio.volumes, wanted);
  applyVolumes(audio);
}
