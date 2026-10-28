import { drawCampfires } from './campfires.js';
import { drawConveyors } from './conveyors.js';
import { drawHammerMarks, drawHammers } from './hammers.js';
import { drawHornets } from './hornets.js';
import { drawKegs } from './kegs.js';
import { drawNests } from './nests.js';
import { drawQuicksand } from './quicksand.js';
import { drawSlabs } from './slabs.js';
import { drawSpikeTraps, drawSpikesOver } from './spike-traps.js';
import { drawTempleBoulders } from './temple-boulders.js';
import { drawTowerStones, drawTowers } from './towers.js';
import { drawVents } from './vents.js';

// what lies or stands on the road in front of the crates and behind the fighters, with the marks
// on the floor where something is about to come down
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
  drawTowers(painter, sheets, { towers: game.towers, cameraX, tick });
  drawNests(painter, sheets, { nests: game.nests, cameraX });
}

// what hangs, rolls, falls or flies over the fighters
export function drawOverheadProps(painter, { game, view, cameraX }) {
  drawSpikesOver(painter, view.fxSheets, { spikeTraps: game.spikeTraps, cameraX });
  drawHammers(painter, view.fxSheets, { hammers: game.hammers, cameraX });
  drawTempleBoulders(painter, view.fxSheets, { game, cameraX });
  drawTowerStones(painter, view.fxSheets, { towers: game.towers, cameraX });
  drawHornets(painter, view.fxSheets, { nests: game.nests, cameraX, tick: game.tickCount });
}
