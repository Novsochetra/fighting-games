import { LOOK_ART } from '../../../art/duel/looks.js';
import { bezier } from '../paths.js';
import { shownRound } from '../show.js';
import { IMPACT_TICK } from '../stages.js';

export const BALL_AT = { x: 150, y: 74 };

const TRAIL_FROM = { x: -140, y: 104 };
const TRAIL_BEND = { x: 40, y: 54 };

// late in the run up to the meeting, so every look draws its shape grown to full size
const LOOK_TICKS = IMPACT_TICK - 4;

export function chaseBall(ticks) {
  return { x: BALL_AT.x, y: BALL_AT.y + Math.round(Math.sin(ticks * 0.3) * 2) };
}

// the looks draw from a clash's scene (scene.js), so the chase hands them one
export function chaseScene(show, tick) {
  const round = shownRound(show);
  const attack = round.picked.attack;
  const look = attack.look ?? 'plain';
  const ball = chaseBall(show.stageTicks);
  const path = { from: TRAIL_FROM, control: TRAIL_BEND, impact: ball };

  return {
    tick,
    t: LOOK_TICKS,
    keeper: true,
    attack,
    defend: round.picked.defend ?? {},
    word: round.result?.word,
    attackWins: round.result?.side === 'attack',
    look,
    art: LOOK_ART[look] ?? LOOK_ART.plain,
    guardArt: null,
    approach: 1,
    after: 0,
    hit: false,
    sinceHit: -1,
    ball,
    ...path,
    trailPoint: (back) => bezier(path.from, path.control, path.impact, Math.max(0, 1 - back)),
  };
}
