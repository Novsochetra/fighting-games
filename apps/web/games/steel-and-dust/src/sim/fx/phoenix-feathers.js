import { addBurst } from '../summons/bursts.js';

const FEATHERS_SCALE = 1.2;

// burning phoenix feathers scatter from where the strike lands, flying on the way it was struck
export function scatterFeathers(game, hit, direction) {
  if (hit.move.feathers) {
    addBurst(game, { sprite: 'feathers', x: hit.x, y: hit.y, scale: FEATHERS_SCALE, direction });
  }
}
