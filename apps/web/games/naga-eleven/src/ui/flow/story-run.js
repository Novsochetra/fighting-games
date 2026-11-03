import { beforeScenes, settleStage, stageOf } from '../../campaign/index.js';

// A story run walks the campaign one screen at a time: a stage's opening scenes, its core (a
// scene, a drill or a match with its line-up card), then what settling it gives (the match's
// result card and the scenes after it), and on to the next stage. `world` is
// `{ chapters, teams }`; a run is plain data, so the app keeps it and saves `run.save` as it goes.

const sceneStep = (scene) => ({ kind: 'scene', scene });

const CORES = {
  training: (stage) => [{ kind: 'training', drill: stage.drill }],
  match: () => [{ kind: 'prematch' }, { kind: 'match' }],
};

export function stepsOf(save, stage) {
  const core = CORES[stage.kind]?.(stage) ?? [];

  return [...beforeScenes(save, stage).map(sceneStep), ...core];
}

const isCore = (step, stage) =>
  step.kind === 'match' || step.kind === 'training' || stage.kind === 'scene';

function settle(run, payload) {
  const settled = settleStage(run.save, run.stage, payload);
  const card =
    run.stage.kind === 'match'
      ? [{ kind: 'postmatch', result: payload, outcome: settled.outcome, passed: settled.passed }]
      : [];

  return { save: settled.save, steps: [...card, ...settled.scenes.map(sceneStep)] };
}

function startStage(save, world, guard = 0) {
  const stage = stageOf(save, world.chapters, world.teams);

  if (!stage) {
    return { save, stage: null, queue: [], settled: true, finished: true };
  }

  const queue = stepsOf(save, stage);

  // a stage with nothing to show (a scene stage whose scene is missing) is passed at once
  if (queue.length === 0 && guard < world.chapters.length * 100) {
    return startStage(settleStage(save, stage).save, world, guard + 1);
  }

  return { save, stage, queue, settled: false, finished: false };
}

export const createStoryRun = (save, world) => startStage(save, world);

export const currentStep = (run) => run.queue[0] ?? null;

// what the step that was showing gave: a drill's or a match's result, nothing for the rest
export function completeStep(run, world, payload) {
  const [step, ...rest] = run.queue;

  if (!step) {
    return run;
  }

  const next =
    !run.settled && isCore(step, run.stage)
      ? (({ save, steps }) => ({ ...run, save, queue: [...rest, ...steps], settled: true }))(
          settle(run, payload),
        )
      : { ...run, queue: rest };

  return next.queue.length > 0 ? next : startStage(next.save, world);
}

export const chapterOf = (run, world) =>
  run.stage ? world.chapters[run.stage.at.chapter] : world.chapters.at(-1);

export const sceneOf = (run, world, id) => chapterOf(run, world)?.scenes?.[id] ?? null;
