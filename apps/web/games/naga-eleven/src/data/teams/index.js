import { CHAPTER_1_TEAMS } from './chapter-1.js';
import { CHAPTER_2_TEAMS } from './chapter-2.js';
import { CHAPTER_3_TEAMS } from './chapter-3.js';
import { CHAPTER_4_TEAMS } from './chapter-4.js';

const ALL_TEAMS = [...CHAPTER_1_TEAMS, ...CHAPTER_2_TEAMS, ...CHAPTER_3_TEAMS, ...CHAPTER_4_TEAMS];

export const TEAMS = Object.fromEntries(ALL_TEAMS.map((team) => [team.id, team]));

export const TEAM_IDS = ALL_TEAMS.map((team) => team.id);
