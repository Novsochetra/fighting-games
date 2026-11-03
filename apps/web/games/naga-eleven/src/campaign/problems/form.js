import { isRecord } from '../values.js';
import { failing } from './known.js';

const FORM_SIDES = ['teamForm', 'opponentForm'];

const FORM_FIELDS = ['stats'];

// past this a side would leave its chapter's band by more than the band is wide
const MOST_FORM = 15;

const isShift = (value) => Number.isInteger(value) && value !== 0 && Math.abs(value) <= MOST_FORM;

const unknownFields = (form) => Object.keys(form).filter((field) => !FORM_FIELDS.includes(field));

const formRules = (side) => [
  [
    (form) => unknownFields(form).length === 0,
    (form) => `unknown ${side} field ${unknownFields(form).join(', ')}`,
  ],
  [
    (form) => isShift(form.stats),
    `${side}.stats is a whole number from -${MOST_FORM} to ${MOST_FORM}, not 0`,
  ],
];

function sideProblems(stage, side, where) {
  const form = stage[side];

  if (form === undefined) {
    return [];
  }

  if (!isRecord(form)) {
    return [`${where}: ${side} is not an object`];
  }

  return failing(formRules(side), form, { where });
}

export const formProblems = (stage, { where }) =>
  FORM_SIDES.flatMap((side) => sideProblems(stage, side, where));
