import { isRecord } from '../values.js';

export const FORMATS = ['7', '11'];

export const HERO_AGES = ['child', 'teen', 'young', 'adult'];

export const STAGE_KINDS = ['scene', 'training', 'match'];

export const RULES = ['friendly', 'group', 'knockout'];

export const CUP_KINDS = ['group', 'knockout'];

export const PORTRAIT_MOODS = [
  'neutral',
  'happy',
  'determined',
  'shocked',
  'sad',
  'angry',
  'smirk',
  'cry',
];

export const SCENE_MOODS = ['calm', 'hope', 'tense', 'sad', 'triumph'];

export const SIDES = ['left', 'right'];

export const BOOSTS = ['spirit'];

export const TRIGGER_NEEDS = {
  kickoff: [],
  firstDuel: [],
  goalFor: [],
  goalAgainst: [],
  halfTime: [],
  secondHalf: [],
  losingLate: ['minute'],
  drawLate: ['minute'],
  specialGoal: ['move'],
  minute: ['at'],
  combo: ['level'],
  skill: [],
};

export const nonEmpty = (value) => typeof value === 'string' && value.length > 0;

export const isBilingual = (text) => isRecord(text) && nonEmpty(text.en) && nonEmpty(text.km);

// a list the caller leaves out is not checked against
export function hasId(collection, id) {
  if (!collection) {
    return true;
  }

  if (collection instanceof Set) {
    return collection.has(id);
  }

  if (Array.isArray(collection)) {
    return collection.some((item) => item === id || item?.id === id);
  }

  return Object.hasOwn(collection, id);
}

export const isKnown = (collection, id) => nonEmpty(id) && hasId(collection, id);

export const optionalKnown = (collection, id) => id === undefined || isKnown(collection, id);

export const formatFits = (team, format) => !team?.format || team.format === format;

export function failing(rules, subject, context) {
  return rules
    .filter(([isFine]) => !isFine(subject, context))
    .map(([, message]) => (typeof message === 'function' ? message(subject, context) : message))
    .map((message) => `${context.where}: ${message}`);
}
