import { drawBlaze, drawFlameLance, drawLavaPool, drawSlagPot } from './forge-hazards.js';
import {
  drawNagaBolt,
  drawRainbowOrb,
  drawSerpentRise,
  drawSpiritNaga,
  drawTide,
} from './moat-hazards.js';
import { drawBamboo, drawBoulder, drawShard, drawSpike } from './rock-hazards.js';
import { drawDustDevil, drawStormStrike, drawThunderBolt } from './storm-hazards.js';
import { drawCanopic, drawCurseMark, drawMirageBolt, drawScarabs } from './temple-hazards.js';
import { drawGlob, drawPuddle } from './venom-hazards.js';
import { drawWasp } from './wasp-hazards.js';

// how each boss's thrown, fired and laid things are drawn, from the fx/ strips
export const BOSS_HAZARD_DRAWERS = {
  boulder: drawBoulder,
  shard: drawShard,
  spike: drawSpike,
  bamboo: drawBamboo,
  glob: drawGlob,
  puddle: drawPuddle,
  wasp: drawWasp,
  thunderBolt: drawThunderBolt,
  dustDevil: drawDustDevil,
  stormStrike: drawStormStrike,
  blaze: drawBlaze,
  slagPot: drawSlagPot,
  lavaPool: drawLavaPool,
  flameLance: drawFlameLance,
  scarabs: drawScarabs,
  canopic: drawCanopic,
  curseMark: drawCurseMark,
  mirageBolt: drawMirageBolt,
  tide: drawTide,
  nagaBolt: drawNagaBolt,
  spiritNaga: drawSpiritNaga,
  serpentRise: drawSerpentRise,
  rainbowOrb: drawRainbowOrb,
};
