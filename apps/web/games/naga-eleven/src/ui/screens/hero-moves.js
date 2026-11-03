import { MOVE_IDS, MOVES } from '../../data/moves.js';

const HERO = 'sochetra';

const KIND_STRINGS = {
  shot: 'kindShot',
  dribble: 'kindDribble',
  save: 'kindSave',
  tackle: 'kindTackle',
};

export const kindString = (kind) => KIND_STRINGS[kind] ?? 'kindShot';

const rowOf = (move, known) => ({
  id: move.id,
  kind: move.kind,
  name: move.name,
  cost: move.cost,
  power: move.power,
  known,
});

// the moves Sochetra has, then the ones of his still asleep, each in the story's order
export function heroMoves(hero) {
  const known = new Set(hero?.moves ?? []);
  const ids = MOVE_IDS.filter((id) => known.has(id) || MOVES[id].owner === HERO);
  const rows = ids.map((id) => rowOf(MOVES[id], known.has(id)));

  return [...rows.filter((row) => row.known), ...rows.filter((row) => !row.known)];
}

export const moveName = (id) => MOVES[id]?.name ?? id;
