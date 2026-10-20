import { COLORS } from '../../art/colors.js';
import { difficultyOf } from '../../data/difficulty.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { setWeapon } from '../fighters/loadout.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';
import { addSparks } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';

// a pickup's middle floats this far above the floor it rests on
const REST_HEIGHT = 6;
const REACH_HEIGHT = 24;

function fall(pickup, terrain) {
  if (pickup.landed) {
    return;
  }
  const floor = floorBelow(terrain, pickup.x, pickup.y + REST_HEIGHT);
  pickup.vy += 0.25;
  pickup.y += pickup.vy;
  if (pickup.y >= floor - REST_HEIGHT) {
    pickup.y = floor - REST_HEIGHT;
    pickup.landed = true;
  }
}

// the hero has to stand on the same floor, not on a platform above it or the ground below
function canCollect(player, pickup) {
  return (
    pickup.landed &&
    player.state !== 'ko' &&
    Math.abs(player.x - pickup.x) < 12 &&
    Math.abs(player.y - (pickup.y + REST_HEIGHT)) < REACH_HEIGHT
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
    fall(pickup, game.terrain);
    if (canCollect(game.player, pickup)) {
      collect(game, pickup);
    }
  }
  game.pickups = game.pickups.filter((pickup) => !pickup.taken);
}
