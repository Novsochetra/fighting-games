import { THOUSAND_CUTS } from '../../data/ultimates/thousand-cuts.js';
import { addBurst } from './bursts.js';
import { crumbleStone } from './soldiers.js';

const { crumbleAfter } = THOUSAND_CUTS;
// a carving nothing calls on crumbles after this long
const CARVING_LIFE = 600;

// the hero's own shape carved in sandstone where he stopped after a cut, holding the follow-through
// of `sprite` ([strip, strike frame, row]) until the ultimate calls on it to swing
export function leaveCarving(game, { x, y, facing, sprite }) {
  game.summons.push({
    kind: 'carving',
    hero: game.settings.hero,
    x,
    y,
    direction: facing,
    sprite,
    side: 'player',
    time: 0,
    swungAt: null,
  });
}

// it swings its cut once more, with him, and crumbles a beat later
export function swingCarving(carving) {
  carving.swungAt = carving.time;
}

function crumbleAt(carving) {
  return carving.swungAt === null ? CARVING_LIFE : carving.swungAt + crumbleAfter;
}

export function updateCarving(game, carving) {
  if (carving.time === crumbleAt(carving)) {
    crumbleStone(game, carving);
    addBurst(game, { sprite: 'rubble', x: carving.x, y: carving.y, scale: 0.8 });
    game.io.sfx('relief', false, { x: carving.x });
    carving.done = true;
  }
}
