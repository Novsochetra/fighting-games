import { difficultyOf } from '../data/difficulty.js';
import { missionAt } from '../data/missions/index.js';
import { createFighter } from './fighters/create-fighter.js';
import { createCrates } from './items/crates.js';
import { refreshPose } from './pose/refresh-pose.js';
import { attachScarf } from './pose/scarf.js';

function freshPlayer() {
  const player = createFighter('player', 'player', 70);
  player.facing = 1;
  attachScarf(player);
  return player;
}

function resetWorld(game, player, missionIndex) {
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
    crates: createCrates(missionAt(missionIndex).crates),
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
    ultFreeze: 0,
    flashTime: 0,
    slashBandTime: 0,
    slowMotion: 0,
    banner: null,
    goArrowTime: 0,
    clearTime: 0,
    continues: 0,
    combo: { count: 0, timer: 0, damage: 0, bump: 0 },
    score: 0,
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
  const player = freshPlayer();
  resetWorld(game, player, missionIndex);
  resetCamera(game.camera);
  resetScore(game);
  refreshPose(player);
}
