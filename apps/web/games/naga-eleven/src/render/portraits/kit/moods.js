const KIT_MOODS = {
  neutral: 'neutral',
  happy: 'grin',
  smirk: 'grin',
  grin: 'grin',
  determined: 'angry',
  angry: 'angry',
  shocked: 'surprised',
  surprised: 'surprised',
  sad: 'hurt',
  cry: 'hurt',
  hurt: 'hurt',
  shout: 'shout',
  calm: 'calm',
};

export const KIT_MOOD_NAMES = Object.keys(KIT_MOODS);

// the child was only drawn in moods, so where he has no neutral face he looks on, determined
export function kitMoodOf(mood, moods) {
  const wanted = KIT_MOODS[mood] ?? 'neutral';

  return moods.includes(wanted) ? wanted : 'angry';
}
