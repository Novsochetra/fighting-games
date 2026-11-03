import { CALM } from './calm.js';
import { DEFEAT } from './defeat.js';
import { HOPE } from './hope.js';
import { MATCH } from './match.js';
import { SAD } from './sad.js';
import { TENSE } from './tense.js';
import { TITLE } from './title.js';
import { TRAINING } from './training.js';
import { TRIUMPH } from './triumph.js';
import { VICTORY } from './victory.js';

const ALL = [TITLE, CALM, HOPE, TENSE, SAD, TRIUMPH, MATCH, TRAINING, VICTORY, DEFEAT];

// a theme's id is the mood setMusic takes: the story's scene moods, and the game's own
export const THEMES = Object.freeze(Object.fromEntries(ALL.map((theme) => [theme.id, theme])));

export const THEME_IDS = Object.freeze(ALL.map((theme) => theme.id));

export const SCENE_MOODS = Object.freeze(['calm', 'hope', 'tense', 'sad', 'triumph']);
