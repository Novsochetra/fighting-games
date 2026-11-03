import { TRAINING_NUMBER } from '../../art/shirt-numbers.js';
import { SOCHETRA_LOOK } from '../../art/training/people.js';
import { drawActor } from '../actors/draw-actor.js';
import { numberColoursOf } from '../actors/number-colours.js';
import { createActorArt } from '../actors/sheets.js';
import { drawShadow } from './people.js';

// he trains in his match number
const SOCHETRA_NUMBER = 10;
const LOOK = {
  ...SOCHETRA_LOOK,
  numberColours: numberColoursOf(TRAINING_NUMBER, SOCHETRA_LOOK.shirt),
};

let fallbackArt = null;

// a drill drawn with no art of its own gets the match's block figure, as a match frame does
export function artOf(actors) {
  if (actors) {
    return actors;
  }

  fallbackArt ??= createActorArt();

  return fallbackArt;
}

// Sochetra as the match's footballer, in a pose of the match's animations ({ name, direction,
// stride or age, loop }); on the drills' grid each pixel of his sheets is one art pixel, so he
// stands on the same chunky pixels as the cones and the goal
export function drawFootballer(context, { actors, pose, x, y }) {
  const place = { x: Math.round(x), y: Math.round(y) };

  drawShadow(context, { ...place, width: 11, alpha: 0.35 });
  drawActor(context, artOf(actors), { look: LOOK, state: pose, ...place, number: SOCHETRA_NUMBER });
}

// how long a kick shows and how far into its frames it starts, for the art in use
export const kickOf = (actors) => artOf(actors).kick;
