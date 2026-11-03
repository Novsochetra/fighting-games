import { findTeam } from '../teams.js';
import { isRecord } from '../values.js';
import {
  CUP_KINDS,
  FORMATS,
  HERO_AGES,
  failing,
  formatFits,
  isBilingual,
  isKnown,
  nonEmpty,
} from './known.js';

const CHAPTER_RULES = [
  [(chapter) => nonEmpty(chapter.id), 'no id'],
  [(chapter) => Number.isInteger(chapter.number) && chapter.number > 0, 'no chapter number'],
  [(chapter) => isBilingual(chapter.title), 'the title is not in both languages'],
  [
    (chapter) => FORMATS.includes(chapter.format),
    (chapter) => `unknown format '${chapter.format}'`,
  ],
  [
    (chapter, { known }) => isKnown(known.teams, chapter.team),
    (chapter) => `unknown team '${chapter.team}'`,
  ],
  [
    (chapter, { known }) => formatFits(findTeam(known.teams, chapter.team), chapter.format),
    (chapter) => `team '${chapter.team}' plays another format than ${chapter.format}`,
  ],
  [
    (chapter) => HERO_AGES.includes(chapter.heroAge),
    (chapter) => `unknown age '${chapter.heroAge}'`,
  ],
  [(chapter) => Array.isArray(chapter.stages) && chapter.stages.length > 0, 'no stages'],
  [(chapter) => isRecord(chapter.scenes), 'no scenes'],
];

const groupSize = (cup, chapter) => new Set([chapter.team, ...(cup.teams ?? [])]).size;

function heroMeetsEachOnce(cup, chapter) {
  const opponents = chapter.stages
    .filter((stage) => stage.rule === 'group' && stage.cup === cup.id)
    .map((stage) => stage.opponent);
  const others = (cup.teams ?? []).filter((team) => team !== chapter.team);

  return opponents.length === others.length && others.every((team) => opponents.includes(team));
}

const CUP_RULES = [
  [(cup) => isBilingual(cup.name), 'the name is not in both languages'],
  [(cup) => CUP_KINDS.includes(cup.kind), (cup) => `unknown kind '${cup.kind}'`],
];

const GROUP_RULES = [
  [(cup) => Array.isArray(cup.teams) && cup.teams.length > 1, 'a group lists its teams'],
  [
    (cup, { known }) => (cup.teams ?? []).every((team) => isKnown(known.teams, team)),
    (cup) => `unknown team among ${(cup.teams ?? []).join(', ')}`,
  ],
  [
    (cup, { chapter }) => cup.advance > 0 && cup.advance < groupSize(cup, chapter),
    'advance is at least 1 and under the number of teams',
  ],
  [(cup) => nonEmpty(cup.failScene), 'a group has a failScene'],
  [
    (cup, { chapter }) => heroMeetsEachOnce(cup, chapter),
    "the hero's team meets each other team of the group once",
  ],
];

export const chapterHeadProblems = ({ chapter, known }) =>
  failing(CHAPTER_RULES, chapter, { known, where: chapter.id ?? 'chapter' });

export function cupProblems({ chapter, known }) {
  const cups = Object.entries(isRecord(chapter.cups) ? chapter.cups : {});

  return cups.flatMap(([id, definition]) => {
    const cup = { ...definition, id };
    const context = { chapter, known, where: `${chapter.id} cup ${id}` };
    const rules = cup.kind === 'group' ? [...CUP_RULES, ...GROUP_RULES] : CUP_RULES;

    return failing(rules, cup, context);
  });
}
