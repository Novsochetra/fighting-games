import { COLORS } from '../../art/colors.js';
import { GROUND_Y } from '../../config.js';
import { WEAPON_IDS, WEAPONS } from '../../data/weapons/index.js';
import { setWeapon } from '../fighters/loadout.js';
import { releaseToken } from '../fighters/tokens.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, showBanner } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { resetRun } from '../reset-run.js';

export function startPlay(game) {
  game.mode = 'play';
  game.fadeIn = 24;
  game.hint = null;
  showBanner(game, { text: 'Fight!', color: COLORS.amber, time: 60 });
  game.io.sfx('go');
}

export function resumePlay(game) {
  game.mode = 'play';
}

export function pause(game) {
  if (game.mode === 'play') {
    game.mode = 'pause';
  }
}

export function restartRun(game) {
  resetRun(game);
  startPlay(game);
}

export function placeOnTitle(game) {
  game.player.x = 90;
  game.camera.x = 0;
  refreshPose(game.player);
}

export function quitToTitle(game) {
  resetRun(game);
  placeOnTitle(game);
  game.mode = 'title';
}

function knockBackNearby(game, player) {
  for (const enemy of game.fighters) {
    if (enemy.side !== 'enemy' || enemy.state === 'ko' || Math.abs(enemy.x - player.x) >= 90) {
      continue;
    }
    const side = enemy.x < player.x ? -1 : 1;
    Object.assign(enemy, { move: null, state: 'juggle', airborne: true, vy: -3 });
    enemy.vx = side * 3;
    releaseToken(game, enemy);
  }
}

export function continueRun(game) {
  const player = game.player;
  Object.assign(player, { hp: player.maxHp, hpLag: player.maxHp, state: 'getup', stateTime: 0 });
  Object.assign(player, { airborne: false, y: GROUND_Y, vy: 0, invincible: 150 });
  game.continues++;
  game.mode = 'play';
  game.io.sfx('go');
  shake(game, 3, 10);
  knockBackNearby(game, player);
  addSparks(game, { x: player.x, y: player.y - 20, count: 20, color: COLORS.butter, speed: 3.5 });
}

export function equipWeapon(game, id) {
  const player = game.player;
  setWeapon(game, player, id);
  addFloatText(game, {
    x: player.x,
    y: player.y - 48,
    text: WEAPONS[id].name,
    color: WEAPONS[id].trailColor,
  });
  game.io.sfx('pickup');
  game.weaponPopup = 50;
  game.durabilityWarned = false;
}

export function cycleWeapon(game) {
  const next = WEAPON_IDS[(WEAPON_IDS.indexOf(game.player.weapon.id) + 1) % WEAPON_IDS.length];
  equipWeapon(game, next);
}
