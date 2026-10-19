import { COLORS } from '../../art/colors.js';
import { REINFORCEMENT_KINDS, ZONES } from '../../data/stage.js';
import { showBanner } from '../fx/effects.js';
import { spawnEnemy } from './spawn-enemy.js';

const WAVE_PAUSE = 45;
const REINFORCEMENT_EVERY = 420;

function queueNextWave(game) {
  const { stage } = game;
  const zone = ZONES[stage.zoneIndex];
  stage.waveIndex++;
  if (stage.waveIndex >= zone.waves.length) {
    return false;
  }
  zone.waves[stage.waveIndex].forEach((kind, i) => {
    stage.spawnQueue.push({ kind, side: i % 2 ? 1 : -1, delay: i === 0 ? 20 : 28 });
  });
  return true;
}

function enterZone(game) {
  const { stage } = game;
  const zone = ZONES[stage.zoneIndex];
  if (!zone || game.player.x < zone.at) {
    return;
  }
  game.arena = { left: zone.left, right: zone.right };
  stage.waveIndex = -1;
  stage.waveDelay = 0;
  queueNextWave(game);
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
    spawnEnemy(game, next.kind, next.side);
  }
}

function leaveZone(game) {
  game.arena = null;
  game.stage.zoneIndex++;
  game.goArrowTime = 200;
  showBanner(game, { text: 'Go!', color: COLORS.amber, time: 60 });
  game.io.sfx('go');
}

function advanceWaves(game) {
  const { stage } = game;
  const anyStanding = game.fighters.some(
    (fighter) => fighter.side === 'enemy' && fighter.state !== 'ko',
  );
  if (anyStanding || stage.spawnQueue.length) {
    stage.waveDelay = 0;
    return;
  }
  if (++stage.waveDelay > WAVE_PAUSE) {
    stage.waveDelay = 0;
    if (!queueNextWave(game)) {
      leaveZone(game);
    }
  }
}

// the boss calls a raider every few seconds while fewer than two are left
function callReinforcements(game) {
  const boss = game.boss;
  if (!boss || boss.state === 'ko' || boss.entering) {
    return;
  }
  if (++game.stage.reinforcementTimer <= REINFORCEMENT_EVERY) {
    return;
  }
  game.stage.reinforcementTimer = 0;
  const helpers = game.fighters.filter(
    (fighter) => fighter.side === 'enemy' && !fighter.def.boss && fighter.state !== 'ko',
  );
  if (helpers.length < 2) {
    const kind = REINFORCEMENT_KINDS[(Math.random() * 3) | 0];
    game.stage.spawnQueue.push({ kind, side: Math.random() < 0.5 ? -1 : 1, delay: 1 });
  }
}

export function updateZones(game) {
  if (!game.arena) {
    enterZone(game);
    return;
  }
  spawnFromQueue(game);
  if (game.clearTime) {
    return;
  }
  advanceWaves(game);
  callReinforcements(game);
}
