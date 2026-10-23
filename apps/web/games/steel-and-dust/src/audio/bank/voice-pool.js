// how many bank sounds of each group may play at once, and in all
export const GROUP_CAPS = { swing: 3, hit: 4, movement: 3, crash: 4, voice: 3, ult: 2 };
export const MAX_VOICES = 14;
const MERGE_SECONDS = 0.035;

export function pruneFinished(voices, now) {
  for (let i = voices.length - 1; i >= 0; i--) {
    if (voices[i].end < now) {
      voices.splice(i, 1);
    }
  }
}

// the same sound twice at once is one sound (multi-hits, a swing through a crowd); shouts never merge
export function isDuplicate(voices, { key, group, start }) {
  if (group === 'voice') {
    return false;
  }
  return voices.some((voice) => voice.key === key && Math.abs(voice.start - start) < MERGE_SECONDS);
}

// lowest priority, then oldest
export function lowestPriority(voices) {
  return voices.reduce((lowest, voice) => {
    const lower = voice.priority < lowest.priority;
    const older = voice.priority === lowest.priority && voice.start < lowest.start;
    return lower || older ? voice : lowest;
  });
}

// which playing voices to stop to make room, and whether the new sound may play at all
export function planRoom(voices, { group, priority }) {
  const steal = [];
  const sameGroup = voices.filter((voice) => voice.group === group);
  if (sameGroup.length >= GROUP_CAPS[group]) {
    const victim = lowestPriority(sameGroup);
    if (victim.priority > priority) {
      return { play: false, steal };
    }
    steal.push(victim);
  }
  const others = voices.filter((voice) => !steal.includes(voice));
  if (others.length >= MAX_VOICES) {
    const victim = lowestPriority(others);
    if (victim.priority > priority) {
      return { play: false, steal };
    }
    steal.push(victim);
  }
  return { play: true, steal };
}

// a different take from the last one and from any copy still playing; roll is a Math.random() value
export function chooseTake(voices, { key, count, last, requested, roll }) {
  const isTaken = (take) =>
    take === last || voices.some((voice) => voice.key === key && voice.take === take);
  let take = Math.floor(roll * count);
  for (let tries = 0; tries < count && count > 1 && isTaken(take); tries++) {
    take = (take + 1) % count;
  }
  if (requested !== undefined) {
    take = requested % count;
  }
  return take;
}
