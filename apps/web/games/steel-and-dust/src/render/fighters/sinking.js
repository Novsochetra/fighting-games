// how far below its feet the sand's surface cuts a sinking body off
const SURFACE = 2;
const REACH = 96;

// a body going down in quicksand (sim/hazards/quicksand.js) is drawn as far lower as it has sunk,
// and nothing of it shows below the sand; any other is drawn as it is
export function drawSinking(painter, fighter, draw) {
  if (!fighter.sunk) {
    draw();
    return;
  }

  const { context } = painter;
  const surface = fighter.y + SURFACE;

  context.save();
  context.beginPath();
  context.rect(fighter.x - REACH, surface - REACH * 2, REACH * 2, REACH * 2);
  context.clip();
  context.translate(0, Math.round(fighter.sunk));
  draw();
  context.restore();
}
