import { CINEMA } from '../../../src/data/cinema.js';
import {
  CHASE_SHOTS,
  CLASH_SHOTS,
  CUTIN_SHOTS,
  FINALE_SHOTS,
  SAVE_CAM_SHOTS,
} from '../../../src/data/shots.js';
import { MOST_STEPS } from '../../../src/render/duel/lens/lens-pen.js';

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
  cinema: { label: 'Timings (CINEMA)', value: CINEMA },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const ORIGINAL = Object.fromEntries(
  Object.entries(EDITABLE).map(([key, entry]) => [key, clone(entry.value)]),
);

const isShot = (shot) => typeof shot === 'object' && shot !== null && typeof shot.on === 'string';

// a save cam's outcome takes over from its flight at the contact, so a list may start after 0
const inOrder = (shot, i, shots) =>
  Number.isFinite(shot.from) && (i === 0 ? shot.from >= 0 : shot.from > shots[i - 1].from);

const stepOk = (shot) => Number.isInteger(shot.step) && shot.step >= 0 && shot.step <= MOST_STEPS;

const glideOk = (shot) =>
  shot.glide === undefined || (Number.isFinite(shot.glide) && shot.glide > 0);

function shotProblem(shot, i, shots) {
  if (!isShot(shot)) {
    return `shot ${i + 1} is not { "from", "on", "step" }`;
  }

  if (!inOrder(shot, i, shots)) {
    return `shot ${i + 1}: "from" is 0 or more, each later than the last`;
  }

  return stepOk(shot) && glideOk(shot)
    ? null
    : `shot ${i + 1}: "step" 0 to ${MOST_STEPS}, "glide" over 0`;
}

// what is wrong with a list of shots, or null
export function shotsProblem(shots) {
  if (!Array.isArray(shots) || shots.length === 0) {
    return 'a list of shots: [{ "from": 0, "on": "middle", "step": 0 }, ...]';
  }

  return shots.map((shot, i) => shotProblem(shot, i, shots)).find(Boolean) ?? null;
}

// timings keep the shape and the kind of every value they had
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

// a list's new value laid into the game's own, or what is wrong with it
export function applyValue(key, value) {
  const problem = key === 'cinema' ? timingsProblem(value, ORIGINAL.cinema) : shotsProblem(value);

  if (!problem) {
    fillIn(EDITABLE[key].value, value);
  }

  return problem;
}

export const resetValue = (key) => fillIn(EDITABLE[key].value, ORIGINAL[key]);

export const isEdited = (key) =>
  JSON.stringify(EDITABLE[key].value) !== JSON.stringify(ORIGINAL[key]);

// every list changed from the file, as the lab keeps them and hands them on
export const editsOf = () =>
  Object.fromEntries(
    Object.keys(EDITABLE)
      .filter(isEdited)
      .map((key) => [key, clone(EDITABLE[key].value)]),
  );

// a list as the editor shows it: a shot a line
export function textOf(key) {
  const value = EDITABLE[key].value;

  return Array.isArray(value)
    ? `[\n  ${value.map((shot) => JSON.stringify(shot)).join(',\n  ')}\n]`
    : JSON.stringify(value, null, 2);
}
