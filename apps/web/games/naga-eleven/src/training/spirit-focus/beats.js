import { nextRandom } from '../../sim/random.js';

const QUICKEST_GAP = 16;

export const approachOf = (tuning, level) =>
  Math.max(44, tuning.approach + tuning.approachPerLevel * (level - 1));

export const beatCountOf = (tuning, level) => tuning.beats + tuning.beatsPerLevel * (level - 1);

// now and then a breath of rest, and from level 2 a quick double beat
function rhythmOf(random, level, gap) {
  const roll = nextRandom(random);

  if (roll < 0.12) {
    return 1.5;
  }

  return level >= 2 && roll > 0.85 && gap / 2 >= QUICKEST_GAP ? 0.5 : 1;
}

// the gap between beats closes from the first to the last, so the tempo rises
export function createBeats(random, { tuning, level }) {
  const count = beatCountOf(tuning, level);
  const startGap = tuning.startGap + tuning.startGapPerLevel * (level - 1);
  const beats = [];
  let at = tuning.leadIn + approachOf(tuning, level);

  for (let i = 0; i < count; i += 1) {
    const progress = count > 1 ? i / (count - 1) : 1;
    const gap = startGap + (tuning.endGap - startGap) * progress;

    beats.push({ at, rating: null, judgedAt: null });
    at += Math.round(gap * rhythmOf(random, level, gap));
  }

  return beats;
}

// the beat a press is for: the earliest still open within the window
export function openBeatNear(beats, clock, window) {
  return beats.find((beat) => beat.rating === null && Math.abs(clock - beat.at) <= window) ?? null;
}

export const tempoOf = (beats, clock) => {
  const next = beats.findIndex((beat) => beat.at >= clock);

  if (next <= 0) {
    return next === 0 && beats.length > 1 ? beats[1].at - beats[0].at : 0;
  }

  return beats[next].at - beats[next - 1].at;
};
