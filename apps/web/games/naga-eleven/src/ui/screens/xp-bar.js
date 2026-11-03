import { xpForLevel, xpToNext } from '../../campaign/levels.js';
import { MAX_LEVEL } from '../../data/progression.js';

const clampShare = (share) => Math.min(1, Math.max(0, share));

export function levelShare({ level, xp }) {
  if (level >= MAX_LEVEL) {
    return 1;
  }

  return clampShare((xp - xpForLevel(level)) / xpToNext(level));
}

export const xpLeft = ({ level, xp }) =>
  level >= MAX_LEVEL ? 0 : Math.max(0, xpForLevel(level + 1) - xp);

// after a match the bar fills on from where it stood; a level gained fills it again from empty
export function xpFill(before, after) {
  const levelUp = after.level > before.level;

  return {
    from: levelUp ? 0 : levelShare(before),
    to: levelShare(after),
    levelUp,
    gained: Math.max(0, after.xp - before.xp),
  };
}
