import { DUEL_SIDES } from '../../art/duel/palette.js';
import { footballerAge, footballerOf } from '../portraits/footballer-of.js';
import { drawPortrait, GROWING_UP, hasPortrait } from '../portraits/index.js';
import { PORTRAIT_ART, toCanvas } from './layout.js';
import { goldFrame, namePlate, spiritGauge } from './plates.js';

// a plain player has no face of his own: he shows as a footballer of his side, of the hero's age
// and in what his side has on in `match`, the same man each time; the friends who grow up with the
// hero show at his age
export function portraitOf(player, { mood, heroAge, match = null }) {
  if (!player.star || !hasPortrait(player.star)) {
    return {
      character: 'footballer',
      mood,
      age: footballerAge(heroAge, match),
      variant: footballerOf(player, match),
    };
  }

  const age = GROWING_UP[player.star] && heroAge ? heroAge : undefined;

  return { character: player.star, mood, age };
}

export function drawPortraitAt(pen, { x, y, look, flip }) {
  drawPortrait(pen.context, {
    ...look,
    kit: true,
    x: pen.origin.x + toCanvas(x),
    y: pen.origin.y + toCanvas(y),
    scale: 3,
    flip,
  });
}

// the portrait in its frame over a block of its side's colour, the name and the gauge under it
export function drawPortraitCard(pen, { player, side, x, y, look, lang }) {
  const ramp = DUEL_SIDES[side];
  const size = PORTRAIT_ART;

  pen.rect([x + 3, y + 3, size, size], ramp[0]);
  goldFrame(pen, { x, y, width: size, height: size });
  pen.rect([x, y, size, size], ramp[2]);
  drawPortraitAt(pen, { x, y, look, flip: side === 'defend' });
  namePlate(pen, { x: x - 1, y: y + size + 4, width: size + 2, name: player.name ?? '', lang });
  spiritGauge(pen, {
    x: x + 6,
    y: y + size + 16,
    width: size - 12,
    spirit: player.spirit ?? 0,
    spiritMax: player.spiritMax ?? 100,
  });
}
