import { drawCampfires } from './campfires.js';
import { drawConveyors } from './conveyors.js';
import { drawHammerMarks, drawHammers } from './hammers.js';
import { drawKegs } from './kegs.js';
import { drawSpikeTraps } from './spike-traps.js';
import { drawTempleBoulders } from './temple-boulders.js';
import { drawQuicksand } from './quicksand.js';
import { drawVents } from './vents.js';
import { drawSlabs } from './slabs.js';
import { drawTowerStones, drawTowers } from './towers.js';

// what stands on the road in front of the crates and behind the fighters: kegs, fires and the
// marks under hammers about to drop
export function drawRoadProps(painter, { game, view, cameraX }) {
  const sheets = view.fxSheets;
  const tick = game.tickCount;

  drawConveyors(painter, sheets, { conveyors: game.conveyors, cameraX, tick });
  drawKegs(painter, sheets, { kegs: game.kegs, cameraX, tick });
  drawCampfires(painter, sheets, { campfires: game.campfires, cameraX, tick });
  drawHammerMarks(painter, { hammers: game.hammers, cameraX, tick });
  drawSpikeTraps(painter, sheets, { spikeTraps: game.spikeTraps, cameraX });
  drawQuicksand(painter, sheets, { quicksand: game.quicksand, cameraX, tick });
  drawVents(painter, sheets, { vents: game.vents, cameraX });
  drawSlabs(painter, sheets, { slabs: game.slabs, cameraX, tick });
  drawKegs(painter, sheets, { kegs: game.kegs, cameraX, tick });
  drawCampfires(painter, sheets, { campfires: game.campfires, cameraX, tick });
  drawHammerMarks(painter, { hammers: game.hammers, cameraX, tick });
  drawTowers(painter, sheets, { towers: game.towers, cameraX, tick });
}

// what hangs or flies over the fighters: the hammers
export function drawOverheadProps(painter, { game, view, cameraX }) {
  drawHammers(painter, view.fxSheets, { hammers: game.hammers, cameraX });
  drawTempleBoulders(painter, view.fxSheets, { game, cameraX });
  drawTowerStones(painter, view.fxSheets, { towers: game.towers, cameraX });
}
