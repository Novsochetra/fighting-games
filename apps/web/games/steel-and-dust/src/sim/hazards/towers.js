import { FX_COLORS } from '../../art/fx-colors.js';
import { TOWER } from '../../data/towers.js';
import { overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { dropStones, updateStones } from './tower-stones.js';

// a struck tower creaks and shudders, comes apart and is gone, its stones still coming down
const NEXT = { cracking: ['breaking', TOWER.crack], breaking: ['gone', TOWER.apart] };

export function createTowers(towers) {
  return towers.map(({ x, y }) => ({
    x,
    y,
    state: 'standing',
    time: 0,
    direction: 1,
    stones: [],
  }));
}

export function towerBox(tower) {
  return {
    x: tower.x - TOWER.halfWidth,
    y: tower.y - TOWER.height,
    width: TOWER.halfWidth * 2,
    height: TOWER.height,
  };
}

// the hero's blows, slash waves and shockwaves crack a standing tower they reach
export function crackTowersIn(game, area, direction) {
  for (const tower of game.towers) {
    if (tower.state === 'standing' && overlaps(area, towerBox(tower))) {
      Object.assign(tower, { state: 'cracking', time: 0, direction });
      game.io.sfx('creak', false, { x: tower.x });
    }
  }
}

function comeApart(game, tower) {
  dropStones(game, tower);
  addDust(game, { x: tower.x, y: tower.y, count: 8, color: FX_COLORS.rootDust });
  shake(game, 3, 12);
  game.io.sfx('crumble', false, { x: tower.x });
}

// what is left of it falls in on itself in a cloud of dust
function fallIn(game, tower) {
  addBurst(game, { sprite: 'rockBurst', x: tower.x, y: tower.y, scale: 0.9 });
  addDust(game, { x: tower.x, y: tower.y, count: 10, color: FX_COLORS.rootDust });
}

function advance(game, tower) {
  const next = NEXT[tower.state];

  if (!next || ++tower.time < next[1]) {
    return;
  }

  Object.assign(tower, { state: next[0], time: 0 });
  if (tower.state === 'breaking') {
    comeApart(game, tower);
  } else {
    fallIn(game, tower);
  }
}

export function updateTowers(game) {
  for (const tower of game.towers) {
    updateStones(game, tower);
    advance(game, tower);
  }
}
