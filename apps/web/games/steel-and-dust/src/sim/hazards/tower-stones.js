import { FX_COLORS } from '../../art/fx-colors.js';
import { STONES, STONE_HIT } from '../../data/towers.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { hazardAttacker } from './hazard-attacker.js';

const STRETCH = (STONES.spread * 2) / STONES.count;

// one spot in each stretch of the road around the tower, kept off the stretch's ends so two
// stones never land as one, ordered the way the blow went
export function stoneSpots(tower) {
  const from = tower.x - tower.direction * STONES.spread;

  return Array.from(
    { length: STONES.count },
    (_, i) => from + tower.direction * STRETCH * (i + randomBetween(0.2, 0.8)),
  );
}

// the stones come down where they meet the first floor, a lintel's top or the road
export function dropStones(game, tower) {
  tower.stones = stoneSpots(tower).map((x, i) => ({
    x,
    floor: floorBelow(game.terrain, x, -Infinity),
    time: 0,
    land: STONES.lead + i * STONES.every,
    facing: i % 2 ? -1 : 1,
  }));
}

// how high a stone is: out of sight above the view, then dropping ever faster onto its spot
export function stoneY(stone) {
  const falling = Math.max(0, stone.time - (stone.land - STONES.fall)) / STONES.fall;

  return stone.floor - STONES.drop * (1 - falling * falling);
}

export function stoneArea(stone) {
  return {
    x: stone.x - STONES.halfWidth,
    y: stone.floor - STONES.height,
    width: STONES.halfWidth * 2,
    height: STONES.height,
  };
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's
function strike(game, stone, target) {
  const hero = target.side === 'player';
  const attacker = hazardAttacker(
    { x: stone.x, direction: stone.facing, side: hero ? 'enemy' : 'player' },
    hero ? 'none' : 'axe',
  );
  const move = hero ? STONE_HIT.hero : STONE_HIT.raider;

  applyHit(game, { attacker, target, move, x: target.x, y: target.y - 16 });
}

function land(game, stone) {
  const area = stoneArea(stone);

  for (const target of game.fighters.slice()) {
    const body = hurtBox(target);

    if (body && !target.entering && overlaps(area, body)) {
      strike(game, stone, target);
    }
  }

  addBurst(game, { sprite: 'rockBurst', x: stone.x, y: stone.floor, scale: 0.45 });
  addDust(game, { x: stone.x, y: stone.floor, count: 6, color: FX_COLORS.rootDust });
  shake(game, 2, 8);
  game.io.sfx('break', false, { x: stone.x });
}

export function updateStones(game, tower) {
  for (const stone of tower.stones) {
    if (++stone.time === stone.land) {
      land(game, stone);
    }
  }

  tower.stones = tower.stones.filter((stone) => stone.time < stone.land);
}
