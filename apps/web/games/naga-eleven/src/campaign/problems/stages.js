import { STAGE_KINDS, failing, isKnown, nonEmpty } from './known.js';
import { matchProblems } from './match.js';

const REWARD_RULES = [
  [
    (stage) =>
      stage.rewards?.xp === undefined ||
      (Number.isFinite(stage.rewards.xp) && stage.rewards.xp >= 0),
    'rewards.xp is a number of 0 or more',
  ],
  [
    (stage, { known }) =>
      [stage.rewards?.moves ?? []].flat().every((move) => isKnown(known.moves, move)),
    (stage) => `unknown move among rewards ${[stage.rewards.moves].flat().join(', ')}`,
  ],
];

const KIND_RULES = {
  scene: [[(stage) => nonEmpty(stage.scene), 'a scene stage names its scene']],
  training: [
    [
      (stage, { known }) => isKnown(known.drills, stage.drill),
      (stage) => `unknown drill '${stage.drill}'`,
    ],
  ],
  match: [],
};

function problemsOfStage(stage, context) {
  if (!STAGE_KINDS.includes(stage?.kind)) {
    return [`${context.where}: unknown kind '${stage?.kind}'`];
  }

  const own = failing([...KIND_RULES[stage.kind], ...REWARD_RULES], stage, context);

  return stage.kind === 'match' ? [...own, ...matchProblems(stage, context)] : own;
}

export function stageProblems({ chapter, known }) {
  return chapter.stages.flatMap((stage, index) => {
    const name = stage?.id ?? stage?.scene ?? stage?.drill ?? stage?.kind;

    return problemsOfStage(stage, {
      chapter,
      known,
      where: `${chapter.id} stage ${index + 1} (${name})`,
    });
  });
}
