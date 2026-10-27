import { drawCampfires } from './campfires.js';
import { drawHammerMarks } from './hammers.js';
import { drawKegs } from './kegs.js';

// what stands on the road in front of the crates and behind the fighters: kegs, fires and the
// marks under hammers about to drop
export function drawRoadProps(painter, { game, view, cameraX }) {
  const sheets = view.fxSheets;
  const tick = game.tickCount;

  drawKegs(painter, sheets, { kegs: game.kegs, cameraX, tick });
  drawCampfires(painter, sheets, { campfires: game.campfires, cameraX, tick });
  drawHammerMarks(painter, { hammers: game.hammers, cameraX, tick });
}
