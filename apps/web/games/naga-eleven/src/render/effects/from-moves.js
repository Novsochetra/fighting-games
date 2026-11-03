import { PASS_COMBO } from '../../data/combos.js';
import { EFFECT_TICKS } from '../../data/move-effects.js';
import { keepAura } from './auras.js';
import { climbCombo, endCombo, noteFinisher } from './combo-watch.js';
import { dropPasses, notePass, passesOf } from './passes.js';
import { meetKeeper, playMove } from './play-move.js';

const MOST_POPUPS = 4;
const POPUP_TICKS = 60;
const FINISHERS = new Set(
  Object.values(PASS_COMBO.finishers).flatMap((levels) => Object.values(levels)),
);

function addPopup(effects, match, { player, move }) {
  effects.popups = [
    ...effects.popups.filter((popup) => match.tick - popup.born < POPUP_TICKS),
    { player, move, born: match.tick },
  ].slice(-MOST_POPUPS);
}

function fire(effects, match, { player, move, partner = null, passes = null }) {
  for (const who of [player, partner]) {
    keepAura(effects, { player: who, move, tick: match.tick, ticks: EFFECT_TICKS.aura });
  }

  playMove(effects, match, { player, move, passes });
}

// a skill in the open plays on: its aura, trail and impact, and its name over him
function onSkill(effects, match, event) {
  addPopup(effects, match, event);
  fire(effects, match, event);
}

// a special stops play for its cut-in: what it does on the pitch waits for play to go on
function onSpecial(effects, match, event) {
  const team = match.players[event.player]?.team;

  if (FINISHERS.has(event.move)) {
    noteFinisher(effects, team);
  }

  effects.pending.push({
    player: event.player,
    move: event.move,
    partner: event.partner ?? null,
    passes: passesOf(effects, match, event.player),
  });
}

export function playPending(effects, match) {
  if (match.phase === 'duel' || effects.pending.length === 0) {
    return;
  }

  for (const waiting of effects.pending.splice(0)) {
    fire(effects, match, waiting);
  }
}

export const MOVE_HANDLERS = {
  skill: onSkill,
  special: onSpecial,
  pass: (effects, match, event) => notePass(effects, match, event.player),
  save: (effects, match, event) => meetKeeper(effects, match, event.keeper),
  combo: climbCombo,
  comboEnd: (effects, match, event) => {
    endCombo(effects, match, event);

    if (event.reason !== 'shot') {
      dropPasses(effects, event.team);
    }
  },
};
