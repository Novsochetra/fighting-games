import { BALL_CUES } from './ball.js';
import { CONTACT_CUES } from './contact.js';
import { CROWD_CUES } from './crowd.js';
import { DUEL_CUES } from './duel.js';
import { IMPACT_CUES } from './impact.js';
import { TRAINING_CUES } from './training.js';
import { UI_CUES } from './ui.js';
import { VOICE_CUES } from './voice.js';
import { WHISTLE_CUES } from './whistle.js';

export const CUES = Object.freeze({
  ...BALL_CUES,
  ...WHISTLE_CUES,
  ...CROWD_CUES,
  ...CONTACT_CUES,
  ...DUEL_CUES,
  ...IMPACT_CUES,
  ...UI_CUES,
  ...VOICE_CUES,
  ...TRAINING_CUES,
});

export const CUE_NAMES = Object.freeze(Object.keys(CUES));

export const CROWD_CUE_NAMES = Object.freeze(Object.keys(CROWD_CUES));
