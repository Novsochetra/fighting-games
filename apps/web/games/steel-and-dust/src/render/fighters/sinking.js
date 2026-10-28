import { PIT_MIDDLE } from '../scene/quicksand.js';

// how far below the middle of the pit the sand's surface cuts a sinking body off
const SURFACE = 2;
const REACH = 96;
// a body caught in the sand steps down off the pit's far rim, where its feet are, into the middle
// of the pit this many pixels for each it sinks, so it goes down in the sand, not behind it
const STEP_IN = 4;

export function sinkingDrop(fighter) {
  return Math.round(Math.min(PIT_MIDDLE, fighter.sunk * STEP_IN) + fighter.sunk);
}

// a body going down in quicksand (sim/hazards/quicksand.js) is drawn down in the middle of the
// pit, as far lower as it has sunk, and nothing of it shows below the sand; any other is drawn as
// it is
export function drawSinking(painter, fighter, draw) {
  if (!fighter.sunk) {
    draw();
    return;
  }

  const { context } = painter;
  const surface = fighter.y + PIT_MIDDLE + SURFACE;

  context.save();
  context.beginPath();
  context.rect(fighter.x - REACH, surface - REACH * 2, REACH * 2, REACH * 2);
  context.clip();
  context.translate(0, sinkingDrop(fighter));
  draw();
  context.restore();
}
