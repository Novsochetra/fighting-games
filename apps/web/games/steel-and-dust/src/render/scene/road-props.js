import { drawCampfires } from './campfires.js';
import { drawHammerMarks, drawHammers } from './hammers.js';
import { drawKegs } from './kegs.js';
import { drawQuicksand } from './quicksand.js';
import { drawVents } from './vents.js';

// what stands on the road in front of the crates and behind the fighters: kegs, fires and the
// marks under hammers about to drop
export function drawRoadProps(painter, { game, view, cameraX }) {
  const sheets = view.fxSheets;
  const tick = game.tickCount;

  drawKegs(painter, sheets, { kegs: game.kegs, cameraX, tick });
  drawCampfires(painter, sheets, { campfires: game.campfires, cameraX, tick });
  drawHammerMarks(painter, { hammers: game.hammers, cameraX, tick });
  drawQuicksand(painter, sheets, { quicksand: game.quicksand, cameraX, tick });
  drawVents(painter, sheets, { vents: game.vents, cameraX });
}

// what hangs or flies over the fighters: the hammers
export function drawOverheadProps(painter, { game, view, cameraX }) {
  drawHammers(painter, view.fxSheets, { hammers: game.hammers, cameraX });
}
