import { PASS_COMBO } from '../../data/combos.js';
import { BOOSTS, TRIGGER_NEEDS, failing, nonEmpty, optionalKnown } from './known.js';

const needsOf = (trigger) => TRIGGER_NEEDS[trigger.when] ?? [];

// the counter shows from x2 and stops at its most, so a combo asked for outside them never comes
const levelFits = (level) =>
  level === undefined ||
  (Number.isInteger(level) && level >= PASS_COMBO.showFrom && level <= PASS_COMBO.most);

const TRIGGER_RULES = [
  [
    (trigger) => Object.hasOwn(TRIGGER_NEEDS, trigger.when),
    (trigger) => `unknown '${trigger.when}'`,
  ],
  [
    (trigger) => needsOf(trigger).every((field) => trigger[field] !== undefined),
    (trigger) => `'${trigger.when}' needs ${needsOf(trigger).join(', ')}`,
  ],
  [
    (trigger) => nonEmpty(trigger.scene) || nonEmpty(trigger.unlock) || nonEmpty(trigger.boost),
    'does nothing: no scene, unlock or boost',
  ],
  [
    (trigger, { known }) => optionalKnown(known.moves, trigger.unlock),
    (trigger) => `unknown move '${trigger.unlock}'`,
  ],
  [
    (trigger, { known }) => optionalKnown(known.moves, trigger.move),
    (trigger) => `unknown move '${trigger.move}'`,
  ],
  [
    (trigger) => levelFits(trigger.level),
    `level is a combo from x${PASS_COMBO.showFrom} to x${PASS_COMBO.most}`,
  ],
  [
    (trigger) => trigger.boost === undefined || BOOSTS.includes(trigger.boost),
    (trigger) => `unknown boost '${trigger.boost}'`,
  ],
  [
    (trigger, { known }) => optionalKnown(known.characters, trigger.with ?? trigger.by),
    (trigger) => `unknown character '${trigger.with ?? trigger.by}'`,
  ],
];

export function triggerProblems(stage, { known, where }) {
  if (stage.triggers === undefined) {
    return [];
  }

  if (!Array.isArray(stage.triggers)) {
    return [`${where}: triggers is not a list`];
  }

  return stage.triggers.flatMap((trigger, index) =>
    failing(TRIGGER_RULES, trigger ?? {}, { known, where: `${where} trigger ${index + 1}` }),
  );
}
