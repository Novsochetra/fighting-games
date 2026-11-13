import { BALL_ART, LOOK_ART } from '../../../../src/art/duel/looks.js';
import {
  DUEL_INK,
  DUEL_UI,
  GOAL_ART,
  PENALTY_ART,
  WORD_RAMPS,
} from '../../../../src/art/duel/palette.js';

// only the game's own colours: hex lives in src/art/ alone, and the lab draws in the Naga's
export const NAGA_ART = LOOK_ART.naga;

export const SHOT_ART = {
  ink: DUEL_INK,
  emerald: NAGA_ART.body,
  gold: NAGA_ART.accent,
  eye: NAGA_ART.eye,
  night: [DUEL_UI.bar, NAGA_ART.sky[0], NAGA_ART.sky[1]],
  purple: [LOOK_ART['seven-naga'].sky[0], ...DUEL_UI.rowLit],
  ember: [...WORD_RAMPS.ember].reverse(),
  flash: DUEL_UI.flash,
  white: DUEL_UI.white,
  crowd: PENALTY_ART.crowd,
  grass: PENALTY_ART.grass,
  line: PENALTY_ART.line,
  lights: PENALTY_ART.lights,
  sky: PENALTY_ART.sky,
  post: GOAL_ART.post,
  mesh: GOAL_ART.mesh,
  ball: BALL_ART,
};
