import { CINEMA } from '../../../src/data/cinema.js';
import {
  CHASE_SHOTS,
  CLASH_SHOTS,
  CUTIN_SHOTS,
  FINALE_SHOTS,
  SAVE_CAM_SHOTS,
} from '../../../src/data/shots.js';
import { MOST_STEPS } from '../../../src/render/duel/lens/lens-pen.js';
import { NAGA_EDITABLE } from './naga-shot/editable.js';

// what the lab can tune while the game draws: the game's own shot lists and timings, changed in
// place, so the next frame plays them
export const EDITABLE = {
  'cutin.portrait': { label: 'Cut-in: a portrait', value: CUTIN_SHOTS.portrait },
  'cutin.strike': { label: "Cut-in: Sochetra's kick", value: CUTIN_SHOTS.strike },
  clash: { label: 'Clash', value: CLASH_SHOTS },
  chase: { label: 'Chase', value: CHASE_SHOTS },
  'saveCam.opening': { label: 'Save cam: the flight', value: SAVE_CAM_SHOTS.opening },
  ...Object.fromEntries(
    ['catch', 'parry', 'punch', 'wall', 'goal', 'miss'].map((outcome) => [
      `saveCam.${outcome}`,
      { label: `Save cam: ${outcome}`, value: SAVE_CAM_SHOTS[outcome] },
    ]),
  ),
  finale: { label: 'Finale', value: FINALE_SHOTS },
  cinema: { label: 'Timings (CINEMA)', value: CINEMA, timings: true },
  ...NAGA_EDITABLE,
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const ORIGINAL = Object.fromEntries(
  Object.entries(EDITABLE).map(([key, entry]) => [key, clone(entry.value)]),
);

const isShot = (shot) => typeof shot === 'object' && shot !== null && typeof shot.on === 'string';

// a save cam's outcome takes over from its flight at the contact, so a list may start after 0
const inOrder = (shot, i, shots) =>
  Number.isFinite(shot.from) && (i === 0 ? shot.from >= 0 : shot.from > shots[i - 1].from);

const stepOk = (shot, most) => Number.isInteger(shot.step) && shot.step >= 0 && shot.step <= most;

const glideOk = (shot) =>
  shot.glide === undefined || (Number.isFinite(shot.glide) && shot.glide > 0);

function shotProblem(shot, i, shots, most) {
  if (!isShot(shot)) {
    return `shot ${i + 1} is not { "from", "on", "step" }`;
  }

  if (!inOrder(shot, i, shots)) {
    return `shot ${i + 1}: "from" is 0 or more, each later than the last`;
  }

  return stepOk(shot, most) && glideOk(shot)
    ? null
    : `shot ${i + 1}: "step" 0 to ${most}, "glide" over 0`;
}

export function shotsProblem(shots, most = MOST_STEPS) {
  if (!Array.isArray(shots) || shots.length === 0) {
    return 'a list of shots: [{ "from": 0, "on": "middle", "step": 0 }, ...]';
  }

  return shots.map((shot, i) => shotProblem(shot, i, shots, most)).find(Boolean) ?? null;
}

export function timingsProblem(value, original) {
  if (typeof original === 'number') {
    return Number.isFinite(value) && value >= 0 ? null : 'a number of 0 or more';
  }

  if (typeof value !== 'object' || value === null) {
    return 'the same keys as before';
  }

  return (
    Object.keys(original)
      .map((key) => timingsProblem(value[key], original[key]))
      .find(Boolean) ?? null
  );
}

function fillIn(target, value) {
  if (Array.isArray(target)) {
    target.splice(0, target.length, ...clone(value));

    return;
  }

  for (const key of Object.keys(target)) {
    if (typeof target[key] === 'object') {
      fillIn(target[key], value[key]);
    } else {
      target[key] = value[key];
    }
  }
}

export function applyValue(key, value) {
  const entry = EDITABLE[key];
  const problem = entry.timings
    ? timingsProblem(value, ORIGINAL[key])
    : shotsProblem(value, entry.most);

  if (!problem) {
    fillIn(entry.value, value);
  }

  return problem;
}

export const resetValue = (key) => fillIn(EDITABLE[key].value, ORIGINAL[key]);

export const isEdited = (key) =>
  JSON.stringify(EDITABLE[key].value) !== JSON.stringify(ORIGINAL[key]);

export const editsOf = () =>
  Object.fromEntries(
    Object.keys(EDITABLE)
      .filter(isEdited)
      .map((key) => [key, clone(EDITABLE[key].value)]),
  );

export function textOf(key) {
  const value = EDITABLE[key].value;

  return Array.isArray(value)
    ? `[\n  ${value.map((shot) => JSON.stringify(shot)).join(',\n  ')}\n]`
    : JSON.stringify(value, null, 2);
}
