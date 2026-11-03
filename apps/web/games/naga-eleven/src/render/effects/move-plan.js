import { LOOK_ART } from '../../art/duel/looks.js';
import { effectOfMove } from '../../data/move-effects.js';
import { moveOf } from '../../data/moves.js';

const plans = new Map();

function planFor(moveId) {
  const move = moveOf(moveId);

  if (!move) {
    return null;
  }

  return {
    move,
    ...effectOfMove(move),
    art: LOOK_ART[move.plannedLook] ?? LOOK_ART[move.look] ?? LOOK_ART.plain,
  };
}

// how a move reads on the pitch, worked out once a move: its shapes (src/data/move-effects.js) in
// its look's colours, the planned look's once it is drawn, else the one it borrows
export function planOf(moveId) {
  if (!plans.has(moveId)) {
    plans.set(moveId, planFor(moveId));
  }

  return plans.get(moveId);
}

const palettes = new WeakMap();

// the codes of maps.js in a look's colours; `deep` takes each a shade darker, for what stands behind
export function paletteOf(art, { deep = false } = {}) {
  const key = deep ? art.body : art;

  if (!palettes.has(key)) {
    const body = deep ? [art.body[0], ...art.body.slice(0, 4)] : art.body;

    palettes.set(key, {
      o: body[0],
      d: body[1],
      m: body[2],
      l: body[3],
      h: body[4],
      y: art.accent[1],
      g: art.accent[2],
      G: art.accent[3],
      e: art.eye[1],
      E: art.eye[2],
      r: art.eye[0],
      w: art.accent.at(-1),
    });
  }

  return palettes.get(key);
}
