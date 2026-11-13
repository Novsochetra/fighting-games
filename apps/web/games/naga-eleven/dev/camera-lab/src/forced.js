import { BASIC_OPTIONS } from '../../../src/data/duels.js';
import { MOVES } from '../../../src/data/moves.js';
import { moveOption } from '../../../src/sim/combos/offers.js';
import { sideOfWord } from './options.js';

// a move as the game's own duel menu offers it, its family and all (a star's or a combo's goal
// plays the finale)
export const optionOf = (id) =>
  MOVES[id] ? moveOption(MOVES[id]) : { ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 };

// what each outcome the lab offers comes to: the round's word, who won it, and how the keeper
// keeps the ball out (src/render/save-cam/moment.js turns them back into the outcome)
const KEEPER_RESULTS = {
  goal: { word: 'goal', side: 'attack', style: 'catch' },
  catch: { word: 'saved', side: 'defend', style: 'catch' },
  parry: { word: 'parried', side: 'defend', style: 'catch' },
  punch: { word: 'saved', side: 'defend', style: 'punch' },
  wall: { word: 'saved', side: 'defend', style: 'wall' },
  wide: { word: 'wide', side: 'defend', style: 'catch' },
  post: { word: 'post', side: 'defend', style: 'catch' },
};

// `auto` leaves the dive to the save cam, which dives the way the ball goes
const diveOf = (dive) => (dive === 'auto' ? undefined : Number(dive));

export function keeperResult({ outcome, side, height, dive }) {
  return { ...KEEPER_RESULTS[outcome], aim: { side, height }, dive: diveOf(dive) };
}

// the keeper's pick: his skill where he is given one, else the save the outcome needs
const keeperPick = ({ guard, outcome }) =>
  optionOf(guard || (outcome === 'punch' ? 'punch' : 'catch'));

// a keeper round made to come out as the lab asks, whatever the duel drew
export function forceKeeperRound(round, settings) {
  round.picked.attack = optionOf(settings.shot);
  round.picked.defend = keeperPick(settings);
  round.result = { ...round.result, ...keeperResult(settings) };
}

export function forceFieldRound(round, { attack, defend, word }) {
  round.picked = { attack: optionOf(attack), defend: optionOf(defend) };
  round.result = { word, side: sideOfWord(word) };
}

// the open-play save cam's moment for the same settings
export function saveCamMoment({ shooter, keeper }, settings) {
  const result = keeperResult(settings);

  return {
    shooter: shooter.index,
    keeper: keeper.index,
    move: settings.shot,
    guard: settings.guard || null,
    result: result.word,
    aim: result.aim,
    dive: result.dive,
    style: result.style,
  };
}
