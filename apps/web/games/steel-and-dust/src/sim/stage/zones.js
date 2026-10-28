import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { showBanner } from '../fx/effects.js';
import { pendingAmbushes, startAmbush } from './ambush.js';
import { cameraTarget } from './camera.js';
import { isFightOver } from './loot-time.js';
import { currentZone } from './mission.js';
import { callReinforcements } from './reinforcements.js';
import { spawnEnemy } from './spawn-enemy.js';

const WAVE_PAUSE = 45;

// a raider still in the trees or under the sand stands in the zone as much as one on the road
function standingEnemies(game) {
  const standing = game.fighters.filter(
    (fighter) => fighter.side === 'enemy' && fighter.state !== 'ko',
  ).length;

  return standing + pendingAmbushes(game);
}

// a lock wave pins the camera to the screen the hero is on until the wave is beaten
function lockScreen(game) {
  if (game.arena.right - game.arena.left <= VIEW_WIDTH) {
    return;
  }
  const left = Math.round(cameraTarget(game));
  game.arena = { left, right: left + VIEW_WIDTH };
}

function releaseWave(game, wave) {
  wave.kinds.forEach((kind, i) => {
    game.stage.spawnQueue.push({
      kind,
      side: i % 2 ? 1 : -1,
      delay: i === 0 ? 20 : 28,
      ambush: wave.ambush,
      slot: i,
    });
  });
  if (wave.lock) {
    lockScreen(game);
  }
}

function enterZone(game) {
  const zone = currentZone(game);
  if (!zone || game.player.x < zone.at) {
    return;
  }
  game.arena = { left: zone.left, right: zone.right };
  Object.assign(game.stage, { waveIndex: 0, waveDelay: 0 });
  releaseWave(game, zone.waves[0]);
  game.goArrowTime = 0;
  if (!zone.boss) {
    showBanner(game, { text: zone.label, color: COLORS.sand, time: 80 });
    game.io.sfx('go');
  }
}

function spawnFromQueue(game) {
  const queue = game.stage.spawnQueue;
  if (!queue.length) {
    return;
  }
  queue[0].delay--;
  if (queue[0].delay <= 0) {
    const next = queue.shift();

    if (next.ambush) {
      startAmbush(game, next);
    } else {
      spawnEnemy(game, next.kind, next.side);
    }
  }
}

function leaveZone(game) {
  game.arena = null;
  game.stage.zoneIndex++;
  game.goArrowTime = 200;
  showBanner(game, { text: 'Go!', color: COLORS.amber, time: 60 });
  game.io.sfx('go');
}

// in a wide zone the next wave comes once the hero walks up to it and at most one raider is
// left; on a single screen the field has to be clear
function nextWaveReady(game, zone, standing) {
  const wave = zone.waves[game.stage.waveIndex + 1];
  return wave && game.player.x >= wave.at && standing <= (zone.screens > 1 ? 1 : 0);
}

function advanceWaves(game, zone) {
  const { stage } = game;
  const standing = standingEnemies(game);
  const waiting = stage.spawnQueue.length > 0;
  const cleared = !waiting && standing === 0 && stage.waveIndex >= zone.waves.length - 1;
  const ready = !waiting && nextWaveReady(game, zone, standing);
  if (!cleared && !ready) {
    stage.waveDelay = 0;
    return;
  }
  if (++stage.waveDelay <= WAVE_PAUSE) {
    return;
  }
  stage.waveDelay = 0;
  if (cleared) {
    leaveZone(game);
  } else {
    releaseWave(game, zone.waves[++stage.waveIndex]);
  }
}

export function updateZones(game) {
  if (!game.arena) {
    enterZone(game);
    return;
  }
  spawnFromQueue(game);
  if (isFightOver(game)) {
    return;
  }
  advanceWaves(game, currentZone(game));
  callReinforcements(game);
}
