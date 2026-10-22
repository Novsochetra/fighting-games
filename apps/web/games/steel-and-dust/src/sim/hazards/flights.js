import { burnBlaze } from './blazes.js';
import { swingHook } from './chain-hook.js';
import { standJar } from './canopic-jars.js';
import { followHero } from './curse-marks.js';
import { flyBoulder } from './boulders.js';
import { skimGround } from './crescents.js';
import { spinDustDevil } from './dust-devils.js';
import { flyBomb } from './enemy-shots.js';
import { runLance } from './flame-lances.js';
import { crawlScarabs } from './scarabs.js';
import { coolLava, flySlagPot } from './slag-pots.js';
import { riseSpike } from './spikes.js';
import { crackStrike } from './storm-strikes.js';
import { runThunderBolt } from './thunder-bolts.js';
import { runRift } from './rifts.js';
import { flyGlob, soakPuddle } from './venom-globs.js';
import { fadeMark } from './pounce-mark.js';
import { flyWasp } from './wasps.js';

// shots that fly their own way, and find their own floor, instead of running straight
export const FLIGHT = {
  bomb: flyBomb,
  crescent: skimGround,
  shard: skimGround,
  boulder: flyBoulder,
  spike: riseSpike,
  glob: flyGlob,
  puddle: soakPuddle,
  wasp: flyWasp,
  pounceMark: fadeMark,
  thunderBolt: runThunderBolt,
  dustDevil: spinDustDevil,
  stormStrike: crackStrike,
  blaze: burnBlaze,
  slagPot: flySlagPot,
  lavaPool: coolLava,
  flameLance: runLance,
  scarabs: crawlScarabs,
  canopic: standJar,
  curseMark: followHero,
  chainHook: swingHook,
  rift: runRift,
};
