import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { MOAT } from '../../data/moat.js';
import { knockOut } from '../combat/knock-out.js';
import { endMove } from '../fighters/actions.js';
import { addFloatText } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { groundAt, waterAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';

function splash(game, x, water) {
  addBurst(game, { sprite: 'splash', x, y: water.level, scale: 0.8 });
  game.io.sfx('splash', false, { x });
}

// the bank on the side nearer `x`, and the way from the water onto it
function bankBeside(game, water, x) {
  const side = x < (water.from + water.to) / 2 ? -1 : 1;
  const bankX = side < 0 ? water.from - MOAT.bankIn : water.to + MOAT.bankIn;

  return { x: bankX, y: groundAt(game.terrain, bankX), side };
}

// the hero or a boss hauls out onto the nearer bank, and only the hero pays for the fall; a
// knocked-out body is laid there and stays down
function climbOut(game, fighter, water) {
  const { x, y } = bankBeside(game, water, fighter.x);

  Object.assign(fighter, { x, y, vx: 0, vy: 0, airborne: false, airDashUsed: false, pogoCount: 0 });
  if (fighter.state === 'ko') {
    return;
  }

  endMove(game, fighter);
  if (fighter.side === 'player') {
    fighter.hp = Math.max(1, fighter.hp - MOAT.heroDamage);
    fighter.invincible = Math.max(fighter.invincible, MOAT.heroInvincible);
  }
}

// its purse washes up on the nearer bank rather than sinking with it
function washAshore(pieces, bank) {
  for (const piece of pieces) {
    Object.assign(piece, { x: bank.x, y: bank.y - 1, vx: bank.side * Math.abs(piece.vx) });
  }
}

// a raider already knocked out just sinks; one still fighting is out at once
function ringOut(game, raider, water) {
  if (raider.state !== 'ko') {
    const spilled = game.loot.length;

    knockOut(game, raider, Math.sign(raider.vx) || raider.facing);
    washAshore(game.loot.slice(spilled), bankBeside(game, water, raider.x));
    game.score += MOAT.ringOutBonus;
    const y = raider.y - 56 * raider.scale;
    addFloatText(game, { x: raider.x, y, text: 'Ring out!', color: COLORS.gold });
  }

  raider.removed = true;
}

function sinks(game, piece) {
  const water = waterAt(game.terrain, piece.x);

  if (!water || piece.y < water.level) {
    return false;
  }

  addSparks(game, { x: piece.x, y: water.level, count: 2, color: FX_COLORS.foam, speed: 1 });

  return true;
}

// the ultimate places the hero itself, wherever it likes
function fallsIn(fighter, water) {
  return water !== null && fighter.y >= water.level && !fighter.removed && fighter.state !== 'ult';
}

export function updateMoat(game) {
  if (!game.terrain.water?.length) {
    return;
  }

  for (const fighter of game.fighters) {
    const water = waterAt(game.terrain, fighter.x);

    if (!fallsIn(fighter, water)) {
      continue;
    }

    splash(game, fighter.x, water);
    if (fighter.side === 'player' || fighter.def.boss) {
      climbOut(game, fighter, water);
    } else {
      ringOut(game, fighter, water);
    }
  }

  game.loot = game.loot.filter((piece) => !sinks(game, piece));
}
