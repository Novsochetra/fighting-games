import { COMBO_LOOKS } from './looks-combos.js';
import { SKILL_LOOKS } from './looks-skills.js';
import { STAR_LOOKS } from './looks-stars.js';

// each move's look sounds its own: shimmer is the charge's pitch, layers the impact's parts
export const SPECIAL_LOOKS = { ...STAR_LOOKS, ...SKILL_LOOKS, ...COMBO_LOOKS };
