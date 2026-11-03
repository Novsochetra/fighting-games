import { moveOf } from '../../data/moves.js';
import { SAVE_STYLES } from '../../data/skills.js';
import { hash } from '../duel/hash.js';
import { KEEPER_SHARE, shotPoint } from './flight.js';
import { DEPTH, project } from './view.js';

// The sim decides a save and the cam shows it (README "Keeper skills and the save cam"). A moment
// the sim gave no aim, dive or style gets a fair one from its result, the same each time it is
// drawn, so the show plays with a sim that does not yet say

const signOf = (value) => (value < 0 ? -1 : 1);

export function defaultAim(result, seed) {
  const side = (hash(seed, 1) - 0.5) * 1.5;
  const height = 0.15 + hash(seed, 2) * 0.6;

  if (result === 'wide') {
    return { side: signOf(side) * (1.14 + hash(seed, 3) * 0.2), height: 0.2 + hash(seed, 4) * 0.7 };
  }

  if (result === 'post') {
    return { side: signOf(side), height };
  }

  return result === 'goal'
    ? { side: signOf(side) * (0.6 + hash(seed, 5) * 0.32), height }
    : { side, height };
}

// he dives the way the ball goes, or stands for one at him; beaten, he sometimes went the wrong way.
// A keeper whose skill is a wall stands big where he is and never dives
export function defaultDive(result, aim, seed, style = 'catch') {
  const toward = Math.abs(aim.side) < 0.22 || style === 'wall' ? 0 : signOf(aim.side);

  return result === 'goal' && toward !== 0 && hash(seed, 6) < 0.3 ? -toward : toward;
}

// a keeper's skill keeps the ball out its own way; with none, a punch punches and the rest catch
export const styleOf = (guard, guardKind) =>
  SAVE_STYLES[guard] ?? (guardKind === 'punch' ? 'punch' : 'catch');

// what the cam plays: a goal, a miss, or the save in the keeper's style (a catch only just
// reached is pushed away, a parry)
export function outcomeOf(result, style) {
  if (result === 'goal' || result === 'wide' || result === 'post') {
    return result;
  }

  return result === 'parried' && style === 'catch' ? 'parry' : style;
}

const RESULT_OF = { goal: 'goal', saved: 'saved', parried: 'parried', wide: 'wide', post: 'post' };

const lookOf = (move, fallback) => moveOf(move)?.look ?? fallback;

const BEATEN = new Set(['goal', 'wide', 'post']);

// one who keeps it out went the way it went: open play's dive is from where he stood, off to one
// side of his goal, and the cam draws him in the middle of it
function diveOf(raw, { result, aim, style, seed }) {
  const dive = raw.dive ?? defaultDive(result, aim, seed, style);

  return !BEATEN.has(result) && dive !== 0 && dive !== signOf(aim.side) ? -dive : dive;
}

// in art pixels, the furthest to his side of his middle a ball meets a keeper who takes it standing
const STANDING_REACH = 9;

const SPOT = project({ x: 0, y: 0, z: DEPTH.keeper });

const offsetOf = (aim) => project(shotPoint(aim, KEEPER_SHARE)).x - SPOT.x;

// a ball he keeps out standing comes at him: open play's keeper stood for it wherever he was, and
// the cam draws him in the middle of the goal, so its aim moves in to within his reach there. A
// wall rises under the ball wherever it comes
function standingAim(aim, { dive, result, style }) {
  const offset = offsetOf(aim);

  if (dive !== 0 || BEATEN.has(result) || style === 'wall' || Math.abs(offset) <= STANDING_REACH) {
    return aim;
  }

  const middle = offsetOf({ ...aim, side: 0 });
  const across = offsetOf({ ...aim, side: 1 }) - middle;

  return { ...aim, side: (Math.sign(offset) * STANDING_REACH - middle) / across };
}

export function camMoment(raw, seed = 0) {
  const result = RESULT_OF[raw.result] ?? 'saved';
  const aim = raw.aim ?? defaultAim(result, seed);
  const style = raw.style ?? styleOf(raw.guard, raw.guardKind);
  const dive = diveOf(raw, { result, aim, style, seed });

  return {
    ...raw,
    result,
    aim: standingAim(aim, { dive, result, style }),
    dive,
    style,
    outcome: outcomeOf(result, style),
    look: lookOf(raw.move, 'plain'),
    guardLook: lookOf(raw.guard, null),
    bonus: raw.bonus ?? 0,
  };
}

const RESULT_PARTS = ['aim', 'dive', 'style'];

// the moment a duel's keeper round comes to, from its picks and its result
export function roundMoment(round) {
  const attack = round.picked.attack ?? {};
  const defend = round.picked.defend ?? {};
  const result = round.result ?? {};

  return {
    shooter: round.attacker,
    keeper: round.defender,
    move: attack.move ?? null,
    guard: defend.move ?? null,
    guardKind: defend.kind ?? null,
    from: attack.from ?? null,
    bonus: attack.bonus ?? 0,
    result: result.word,
    ...Object.fromEntries(RESULT_PARTS.map((part) => [part, result[part]])),
  };
}
