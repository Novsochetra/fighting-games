import {
  CHAPTER_XP_SCALE,
  GRADE_XP,
  LOWEST_GRADE,
  MATCH_XP,
  SCORE_XP,
} from '../data/progression.js';

const counted = (value, max) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));

const scaleOf = (chapterNumber) => CHAPTER_XP_SCALE[chapterNumber] ?? 1;

export function matchXp(result, outcome, chapterNumber) {
  const points =
    MATCH_XP[outcome] +
    MATCH_XP.goal * counted(result.goalsFor, MATCH_XP.maxGoals) +
    MATCH_XP.heroGoal * counted(result.goalsBySochetra, MATCH_XP.maxHeroGoals) +
    MATCH_XP.duel * counted(result.duelsWon, MATCH_XP.maxDuels);

  return Math.round(points * scaleOf(chapterNumber));
}

export function trainingXp(result, chapterNumber) {
  const gradePoints = GRADE_XP[result.grade] ?? GRADE_XP[LOWEST_GRADE];
  const score = Math.max(0, Number(result.score) || 0);
  const scorePoints = (SCORE_XP.maxBonus * score) / (score + SCORE_XP.half);

  return Math.round((gradePoints + scorePoints) * scaleOf(chapterNumber));
}
