import { shotOffersOf } from '../combos/offers.js';
import { comboLiftOf } from '../combos/pass-combo.js';
import { chooseForComputer } from './choose.js';
import { pushEvent } from './events.js';
import { pairKey } from './geometry.js';
import { createRound } from './rounds.js';

function hold(player) {
  player.vx = 0;
  player.vy = 0;
  player.charge = 0;
}

// `attack` is an option the attacker has already struck with (a special shot let go of shoot);
// the shots on offer and his combo's lift are kept as the duel starts, as its clock runs on while
// the human picks
export function startDuel(match, { kind, attacker, defender, attack = null, offers = null }) {
  const memory = match.duelMemory;
  const round = createRound({ kind, attacker, defender });

  round.offers = offers ?? shotOffersOf(match, attacker);
  round.lift = comboLiftOf(match, attacker).power;

  if (attack) {
    round.picked.attack = attack;
    round.carried = true;
  }

  match.duel = {
    id: memory.next,
    kind,
    attacker: attacker.index,
    defender: defender.index,
    shooter: kind === 'keeper' ? attacker.index : null,
    keeper: kind === 'keeper' ? defender.index : null,
    startTick: match.tick,
    ticks: 0,
    stage: 'choose',
    rounds: [round],
    paid: [],
    outcome: null,
    doneTicks: 0,
  };
  memory.next += 1;
  memory.pairs[pairKey(attacker, defender)] = match.tick;
  hold(attacker);
  hold(defender);
  match.phase = 'duel';
  match.phaseTicks = 0;
  pushEvent(match, { type: 'duel', duel: match.duel });
  chooseForComputer(match, round);

  return true;
}
