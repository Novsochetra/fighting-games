import { findTeam } from '../teams.js';
import { formProblems } from './form.js';
import { RULES, failing, formatFits, isBilingual, isKnown, nonEmpty } from './known.js';
import { triggerProblems } from './triggers.js';

function cupFits(stage, chapter) {
  if (stage.rule === 'friendly') {
    return stage.cup === undefined || Boolean(chapter.cups?.[stage.cup]);
  }

  return chapter.cups?.[stage.cup]?.kind === stage.rule;
}

const MATCH_RULES = [
  [(stage) => nonEmpty(stage.id), 'a match has an id'],
  [(stage) => RULES.includes(stage.rule), (stage) => `unknown rule '${stage.rule}'`],
  [
    (stage, { chapter }) => cupFits(stage, chapter),
    (stage) => `no ${stage.rule} cup '${stage.cup}' in the chapter`,
  ],
  [
    (stage, { known }) => isKnown(known.teams, stage.opponent),
    (stage) => `unknown opponent '${stage.opponent}'`,
  ],
  [(stage, { chapter }) => stage.opponent !== chapter.team, "the hero's team is the opponent"],
  [
    (stage, { known, chapter }) =>
      formatFits(findTeam(known.teams, stage.opponent), chapter.format),
    (stage) => `'${stage.opponent}' plays another format`,
  ],
  [
    (stage, { known }) => isKnown(known.venues, stage.venue),
    (stage) => `unknown venue '${stage.venue}'`,
  ],
  [
    (stage) => stage.round === undefined || isBilingual(stage.round),
    'the round is not in both languages',
  ],
  [
    (stage) => nonEmpty(stage.after?.win) && nonEmpty(stage.after?.lose),
    'a match has a win and a lose scene',
  ],
  [
    (stage) => stage.rule === 'knockout' || nonEmpty(stage.after?.draw),
    'a match that can end level has a draw scene',
  ],
];

export const matchProblems = (stage, context) => [
  ...failing(MATCH_RULES, stage, context),
  ...formProblems(stage, context),
  ...triggerProblems(stage, context),
];
