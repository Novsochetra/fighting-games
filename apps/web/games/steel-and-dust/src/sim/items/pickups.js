import { COLORS } from '../../art/colors.js';
import { GROUND_Y } from '../../config.js';
import { difficultyOf } from '../../data/difficulty.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { setWeapon } from '../fighters/loadout.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';
import { addSparks } from '../fx/particles.js';

function fall(pickup) {
  if (pickup.landed) {
    return;
  }
  pickup.vy += 0.25;
  pickup.y += pickup.vy;
  if (pickup.y >= GROUND_Y - 6) {
    pickup.y = GROUND_Y - 6;
    pickup.landed = true;
  }
}

function canCollect(player, pickup) {
  return (
    pickup.landed &&
    player.state !== 'ko' &&
    Math.abs(player.x - pickup.x) < 12 &&
    player.y > GROUND_Y - 24
  );
}

function eatRation(game, player, pickup) {
  const heal = difficultyOf(game.settings).heal;
  player.hp = Math.min(player.maxHp, player.hp + heal);
  addFloatText(game, { x: pickup.x, y: pickup.y - 14, text: `+${heal} HP`, color: COLORS.mint });
  game.io.sfx('heal');
  addRing(game, { x: player.x, y: player.y - 16, color: COLORS.mint });
}

function takeWeapon(game, player, pickup) {
  const weapon = WEAPONS[pickup.item];
  setWeapon(game, player, pickup.item);
  addFloatText(game, {
    x: pickup.x,
    y: pickup.y - 14,
    text: `${weapon.name}!`,
    color: weapon.trailColor,
  });
  game.io.sfx('pickup');
  addRing(game, { x: pickup.x, y: pickup.y, color: weapon.trailColor });
  game.weaponPopup = 50;
  buzz(game, 15);
}

function collect(game, pickup) {
  pickup.taken = true;
  if (pickup.item === 'ration') {
    eatRation(game, game.player, pickup);
  } else {
    takeWeapon(game, game.player, pickup);
  }
  addSparks(game, { x: pickup.x, y: pickup.y, count: 10, color: COLORS.butter, speed: 2.2 });
}

export function updatePickups(game) {
  for (const pickup of game.pickups) {
    pickup.time++;
    fall(pickup);
    if (canCollect(game.player, pickup)) {
      collect(game, pickup);
    }
  }
  game.pickups = game.pickups.filter((pickup) => !pickup.taken);
}
