import { COLORS } from '../../art/colors.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { randomBetween } from '../../lib/math.js';
import { holdsOwnWeapon, takeOwnWeapon } from '../fighters/loadout.js';
import { shake } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';

function shatterWeapon(game, player, weapon) {
  const hand = player.joints ? player.joints.frontHand : { x: player.x, y: player.y - 24 };
  for (let i = 0; i < 16; i++) {
    game.particles.push({
      kind: 'chunk',
      x: hand.x,
      y: hand.y,
      vx: randomBetween(-2.8, 2.8),
      vy: randomBetween(-3.8, -1),
      life: 50,
      maxLife: 50,
      color: i % 2 ? COLORS.steel : COLORS.slate,
    });
  }
  addRing(game, { x: hand.x, y: hand.y, color: COLORS.red });
  addFloatText(game, {
    x: player.x,
    y: player.y - 48,
    text: `${weapon.name} broke!`,
    color: COLORS.red,
  });
  game.io.sfx('shatter');
  shake(game, 2, 8);
  takeOwnWeapon(game, player);
  game.weaponPopup = 40;
}

export function useDurability(game, player) {
  if (holdsOwnWeapon(player)) {
    return;
  }
  player.weapon.durability--;
  const weapon = WEAPONS[player.weapon.id];
  const left = player.weapon.durability;
  if (left > 0 && left <= Math.ceil(weapon.durability * 0.25) && !game.durabilityWarned) {
    game.durabilityWarned = true;
    addFloatText(game, {
      x: player.x,
      y: player.y - 48,
      text: `${weapon.name} cracking!`,
      color: COLORS.coral,
    });
    game.io.sfx('lowDurability');
  }
  if (left <= 0) {
    shatterWeapon(game, player, weapon);
  }
}
