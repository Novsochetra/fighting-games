import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { VENT, VENT_BLAST } from '../../data/vents.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { igniteTarget } from '../summons/burn.js';
import { hazardAttacker } from './hazard-attacker.js';
import { VENT_BEAT, ventPhase } from './vent-beat.js';

// a raider lying on the grate is thrown up off it with the rest
const ON_THE_FLOOR = new Set(['down', 'getup']);

// a vent far off the screen still erupts, but it neither shakes the view nor is heard
const withinEarshot = (game, vent) =>
  Math.abs(vent.x - game.camera.x - VIEW_WIDTH / 2) < VIEW_WIDTH;

// each vent keeps its own beat, so two on one floor never erupt together
export function createVents(vents) {
  return vents.map(({ x, y }) => ({ x, y, time: x % VENT_BEAT, struck: new Set() }));
}

// the column of slag over the grate, as tall as it is drawn
export function columnArea(vent) {
  return {
    x: vent.x - VENT.halfWidth,
    y: vent.y - VENT.height,
    width: VENT.halfWidth * 2,
    height: VENT.height,
  };
}

// a raider caught is the hero's hit, so it scores and builds the combo, and it burns after; the
// hero caught is hurt as by a raider's, and is not set alight
function blast(game, vent, target) {
  const hero = target.side === 'player';
  const direction = target.x >= vent.x ? 1 : -1;
  const side = hero ? 'enemy' : 'player';
  const attacker = hazardAttacker({ x: vent.x, direction, side }, hero ? 'none' : 'axe');
  const move = hero ? VENT_BLAST.hero : VENT_BLAST.raider;

  if (!hero && !target.invincible && ON_THE_FLOOR.has(target.state)) {
    Object.assign(target, { state: 'juggle', airborne: true });
  }

  const landed = applyHit(game, { attacker, target, move, x: target.x, y: target.y - 12 });
  if (landed && !hero) {
    igniteTarget(game, target, VENT.burn);
  }

  return landed;
}

// each body in the column is struck once an eruption, as soon as it can be
function engulf(game, vent) {
  const area = columnArea(vent);

  for (const target of game.fighters.slice()) {
    const body = hurtBox(target);
    const caught = body && !target.entering && !vent.struck.has(target) && overlaps(area, body);

    if (caught && blast(game, vent, target)) {
      vent.struck.add(target);
    }
  }
}

function erupt(game, vent) {
  vent.struck.clear();
  if (!withinEarshot(game, vent)) {
    return;
  }

  addSparks(game, { x: vent.x, y: vent.y - 6, count: 12, color: FX_COLORS.slag, speed: 2.8 });
  shake(game, 2, 10);
  game.io.sfx('flame', false, { x: vent.x });
}

export function updateVents(game) {
  for (const vent of game.vents) {
    vent.time = (vent.time + 1) % VENT_BEAT;
    const { phase, at } = ventPhase(vent.time);

    if (phase === 'glow' && at === 0 && withinEarshot(game, vent)) {
      game.io.sfx('sizzle', false, { x: vent.x });
    } else if (phase === 'erupt') {
      if (at === 0) {
        erupt(game, vent);
      }

      engulf(game, vent);
    }
  }
}
