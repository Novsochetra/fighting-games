import { HEAVY_ART } from '../../art/heavy-fx/index.js';
import { HEAVY_FEEL } from '../../data/heavy-feel/index.js';
import { heroById } from '../../data/heroes.js';
import { activeEnd } from '../../data/moves/define-move.js';
import { isHeavyMove } from '../../data/moves/heavy-moves.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { heroAnimation } from '../hero-animation.js';
import { HEAVY_KITS } from './heavy/index.js';

// the afterimage trail runs from just before the strike to a little after the blow
const TRAIL_LEAD = 2;
const TRAIL_TAIL = 4;

function shadeOf(game) {
  return heroById(game.settings.hero).id;
}

// a move that rushes, dives or lunges on its own keeps its own way of moving
function lunge(fighter, move, feel) {
  if (fighter.airborne || move.forward || move.sustain || move.dive) {
    return;
  }
  fighter.vx = fighter.facing * (feel.moves[move.id]?.lunge ?? feel.lunge);
}

function addHeavyAfterimage(fighter, { art, feel }) {
  fighter.afterimages.push({
    x: fighter.x,
    y: fighter.y,
    facing: fighter.facing,
    sprite: heroAnimation(fighter),
    row: WEAPONS[fighter.weapon.id].spriteRow,
    life: feel.afterimageLife,
    color: art.trail,
  });
}

function inTrail(move, time) {
  return time >= move.startup - TRAIL_LEAD && time < activeEnd(move) + TRAIL_TAIL;
}

function windUp(game, fighter, { move, kit }) {
  // a charged heavy has gathered its power already, with its own sounds
  if (!move.chargeLevel) {
    game.io.sfx(kit.sounds.charge, false, { x: fighter.x });
  }
  kit.windup(game, fighter, move);
}

function strike(game, fighter, { move, kit, feel }) {
  lunge(fighter, move, feel);
  if (kit.sounds.release) {
    game.io.sfx(kit.sounds.release, false, { x: fighter.x });
  }
  kit.release(game, fighter, move);
}

// every tick of a hero's heavy: the Shade's own power gathers, strikes and trails (heavy/<shade>.js)
export function updateHeavyFeel(game, fighter, move, time) {
  if (fighter !== game.player || !isHeavyMove(move)) {
    return;
  }
  const shade = shadeOf(game);
  const parts = { move, kit: HEAVY_KITS[shade], feel: HEAVY_FEEL[shade], art: HEAVY_ART[shade] };
  if (time === 0) {
    windUp(game, fighter, parts);
  }
  if (time < move.startup) {
    parts.kit.gather(game, fighter, move, time);
  }
  if (time === move.startup) {
    strike(game, fighter, parts);
  }
  if (time >= move.startup && time < activeEnd(move)) {
    parts.kit.trail(game, fighter, move, time);
  }
  if (inTrail(move, time) && time % parts.feel.afterimageEvery === 0) {
    addHeavyAfterimage(fighter, parts);
  }
}

// each blow of a hero's heavy that lands
export function heavyImpact(game, hit) {
  if (hit.attacker === game.player && isHeavyMove(hit.move)) {
    HEAVY_KITS[shadeOf(game)].impact(game, hit);
  }
}
