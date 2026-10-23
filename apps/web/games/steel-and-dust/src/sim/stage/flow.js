import { COLORS } from '../../art/colors.js';
import { HERO_THEMES } from '../../art/hero-themes.js';
import { heroById } from '../../data/heroes.js';
import { WEAPON_IDS, WEAPONS } from '../../data/weapons/index.js';
import { setWeapon } from '../fighters/loadout.js';
import { floorUnder, placeOnGround } from '../fighters/terrain-motion.js';
import { releaseToken } from '../fighters/tokens.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, showBanner } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { resetRun } from '../reset-run.js';
import { hasLivesLeft } from './lives.js';
import { missionOf } from './mission.js';
import { REVEAL_FRAMES } from './stage-clear.js';

function announceMission(game) {
  const mission = missionOf(game);
  game.fadeIn = REVEAL_FRAMES;
  showBanner(game, {
    text: `Mission ${mission.number}`,
    sub: mission.name,
    color: COLORS.amber,
    time: 140,
    stamp: true,
  });
  game.io.sfx('reveal');
}

export function startPlay(game) {
  game.mode = 'play';
  game.hint = null;
  announceMission(game);
}

// the score, the clock, the continues, the lives and the ULT bar carry over; the hero starts fresh
export function enterNextMission(game) {
  const { score, playTime, continues, lives, ultMeter } = game;
  resetRun(game, game.missionIndex + 1);
  Object.assign(game, { score, playTime, continues, lives, ultMeter });
  announceMission(game);
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
  const { lives } = game;
  resetRun(game, game.missionIndex);
  game.lives = lives;
  startPlay(game);
}

export function playFromStart(game) {
  resetRun(game, 0);
  startPlay(game);
}

export function placeOnTitle(game) {
  game.player.x = 90;
  placeOnGround(game.terrain, game.player);
  game.camera.x = 0;
  refreshPose(game.player);
}

export function selectMission(game, index) {
  resetRun(game, index);
  placeOnTitle(game);
}

export function quitToTitle(game) {
  selectMission(game, 0);
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
  if (!hasLivesLeft(game)) {
    return;
  }
  const player = game.player;
  Object.assign(player, { hp: player.maxHp, hpLag: player.maxHp, state: 'getup', stateTime: 0 });
  const y = floorUnder(game.terrain, player);
  Object.assign(player, { airborne: false, y, vy: 0, invincible: 150 });
  game.continues++;
  game.mode = 'play';
  game.io.sfx('go');
  shake(game, 3, 10);
  knockBackNearby(game, player);
  addSparks(game, { x: player.x, y: player.y - 20, count: 20, color: COLORS.butter, speed: 3.5 });
}

// a fallen hero may come back as another Shade: the run, the weapon in hand and the ULT bar stay
export function continueAs(game, heroId) {
  if (!hasLivesLeft(game)) {
    return;
  }
  const hero = heroById(heroId);
  game.settings.hero = hero.id;
  game.io.saveSettings(game.settings);
  continueRun(game);
  const { player } = game;
  addFloatText(game, {
    x: player.x,
    y: player.y - 52,
    text: hero.name,
    color: HERO_THEMES[hero.id].spark,
  });
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
