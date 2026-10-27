import { TREE, TREE_FALL } from '../../data/trees.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { hazardAttacker } from './hazard-attacker.js';

const DUST_EVERY = 16;
// a felled tree creaks over, falls, and lies on the road from then on
const NEXT = { creaking: ['falling', TREE.creak], falling: ['fallen', TREE.fall] };

export function createTrees(trees) {
  return trees.map(({ x, y }) => ({ x, y, state: 'standing', time: 0, direction: 1 }));
}

export function trunkBox(tree) {
  return {
    x: tree.x - TREE.halfWidth,
    y: tree.y - TREE.height,
    width: TREE.halfWidth * 2,
    height: TREE.height,
  };
}

// the road the trunk comes down on, from just past the stump to its tip
export function fallArea(tree) {
  const near = tree.x + tree.direction * TREE.from;
  const far = tree.x + tree.direction * TREE.reach;

  return {
    x: Math.min(near, far),
    y: tree.y - TREE.depth,
    width: TREE.reach - TREE.from,
    height: TREE.depth,
  };
}

// a blow fells a standing tree the way it was struck
export function fellTreesIn(game, area, direction) {
  for (const tree of game.trees) {
    if (tree.state === 'standing' && overlaps(area, trunkBox(tree))) {
      Object.assign(tree, { state: 'creaking', time: 0, direction });
      game.io.sfx('creak', false, { x: tree.x });
    }
  }
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's
function crush(game, tree, target) {
  const hero = target.side === 'player';
  const attacker = hazardAttacker(
    { x: tree.x, direction: tree.direction, side: hero ? 'enemy' : 'player' },
    hero ? 'none' : 'axe',
  );
  const move = hero ? TREE_FALL.hero : TREE_FALL.raider;

  applyHit(game, { attacker, target, move, x: target.x, y: target.y - 12 });
}

function land(game, tree) {
  const area = fallArea(tree);

  for (const target of game.fighters.slice()) {
    const body = hurtBox(target);

    if (body && overlaps(area, body)) {
      crush(game, tree, target);
    }
  }

  for (let x = area.x; x <= area.x + area.width; x += DUST_EVERY) {
    addDust(game, { x, y: tree.y, count: 3 });
  }

  shake(game, 4, 14);
  game.io.sfx('timber', false, { x: area.x + area.width / 2 });
}

export function updateTrees(game) {
  for (const tree of game.trees) {
    const next = NEXT[tree.state];

    if (!next || ++tree.time < next[1]) {
      continue;
    }

    Object.assign(tree, { state: next[0], time: 0 });
    if (tree.state === 'fallen') {
      land(game, tree);
    }
  }
}
