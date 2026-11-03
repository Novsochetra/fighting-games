import { checkTriggers, createWatch } from '../../story/index.js';
import { recordUnlock } from './match-ledger.js';
import { heroOf } from './match-setup.js';

// the story's moments inside a match: the scenes its triggers call for, waiting their turn, and
// what they wake in Sochetra
export const createMoments = (triggers = []) => ({ watch: createWatch(triggers), scenes: [] });

function wake(match, ledger, move) {
  const hero = heroOf(match);

  if (hero && !hero.moves.includes(move)) {
    hero.moves = [...hero.moves, move];
  }

  recordUnlock(ledger, move);
}

function fillSpirit(match) {
  const hero = heroOf(match);

  if (hero) {
    hero.spirit = hero.spiritMax;
  }
}

export function hearMoments(moments, { match, ledger, events }) {
  for (const fired of checkTriggers(moments.watch, match, events)) {
    if (fired.unlock) {
      wake(match, ledger, fired.unlock);
    }

    if (fired.boost === 'spirit') {
      fillSpirit(match);
    }

    if (fired.scene) {
      moments.scenes.push(fired.scene);
    }
  }
}

export const nextMomentScene = (moments) => moments.scenes.shift() ?? null;
