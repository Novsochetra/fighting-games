import { difficultyOf } from '../data/difficulty.js';
import { START_LIVES } from '../data/player.js';
import { missionAt } from '../data/missions/index.js';
import { createFighter } from './fighters/create-fighter.js';
import { takeOwnWeapon } from './fighters/loadout.js';
import { createRoadHazards } from './hazards/road-hazards.js';
import { createCrates } from './items/crates.js';
import { refreshPose } from './pose/refresh-pose.js';
import { attachScarf } from './pose/scarf.js';
import { groundAt } from './stage/terrain.js';

const START_X = 70;

// each road scatters its loot its own way, the same way every time it is played
const lootSeedFor = (missionIndex) => (0x9e3779b9 + missionIndex * 0x85ebca6b) >>> 0;

function freshPlayer(terrain) {
  const player = createFighter('player', 'player', START_X, groundAt(terrain, START_X));
  player.facing = 1;
  attachScarf(player);
  return player;
}

function resetWorld(game, player, missionIndex) {
  const mission = missionAt(missionIndex);
  Object.assign(game, {
    fighters: [player],
    player,
    boss: null,
    particles: [],
    effects: [],
    floaters: [],
    shockwaves: [],
    projectiles: [],
    summons: [],
    pickups: [],
    loot: [],
    chests: [],
    lootFx: [],
    lootSeed: lootSeedFor(missionIndex),
    crates: createCrates(mission.crates),
    ...createRoadHazards(mission),
    terrain: mission.terrain,
    arena: null,
    missionIndex,
  });
  game.stage = { zoneIndex: 0, waveIndex: -1, spawnQueue: [], waveDelay: 0, reinforcementTimer: 0 };
}

// the zoom amount, zoom target and shake amount survive a restart, as they always have
function resetCamera(camera) {
  camera.x = 0;
  camera.shakeTime = 0;
  camera.zoom.time = 0;
  camera.kickX = 0;
  camera.kickY = 0;
}

function resetScore(game) {
  Object.assign(game, {
    ultMeter: 0,
    heavyRefusedAt: -Infinity,
    fxSeed: 1,
    ultFreeze: 0,
    flashTime: 0,
    slashBandTime: 0,
    slowMotion: 0,
    banner: null,
    goArrowTime: 0,
    lootTime: 0,
    clearTime: 0,
    continues: 0,
    lives: START_LIVES,
    combo: { count: 0, timer: 0, damage: 0, bump: 0 },
    score: 0,
    coins: 0,
    missionLoot: { coin: 0, gem: 0, apple: 0 },
    coinStreak: { count: 0, timer: 0 },
    purseBump: 0,
    playTime: 0,
    attackTokens: difficultyOf(game.settings).tokens,
    newBestScore: false,
    hurtFlash: 0,
    comboResult: null,
    weaponPopup: 0,
    durabilityWarned: false,
  });
}

export function resetRun(game, missionIndex = 0) {
  const player = freshPlayer(missionAt(missionIndex).terrain);
  resetWorld(game, player, missionIndex);
  resetCamera(game.camera);
  resetScore(game);
  takeOwnWeapon(game, player);
  refreshPose(player);
}
