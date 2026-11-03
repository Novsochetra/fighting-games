import { describe, expect, it } from 'vitest';
import { newSave } from '../../../../src/campaign/index.js';
import {
  completeStep,
  createStoryRun,
  currentStep,
  sceneOf,
} from '../../../../src/ui/flow/story-run.js';
import {
  FIXTURE_CHAPTERS,
  FIXTURE_TEAMS,
  matchResult,
  trainingResult,
} from '../../../support/campaign-fixtures.js';

const world = { chapters: FIXTURE_CHAPTERS, teams: FIXTURE_TEAMS };

// plays the run like a player who wins every match, logging each screen's kind
function playThrough(run, { lose = () => false, limit = 400 } = {}) {
  const seen = [];
  let current = run;

  while (!current.finished && seen.length < limit) {
    const step = currentStep(current);
    const payload = {
      training: () => trainingResult(step.drill),
      match: () => (lose(current) ? matchResult(0, 2) : matchResult(2, 0)),
    }[step.kind]?.();

    seen.push(step.kind);
    current = completeStep(current, world, payload);
  }

  return { run: current, seen };
}

describe('a story run', () => {
  it('opens a stage with its scenes, then its core', () => {
    const run = createStoryRun(newSave({ seed: 3 }), world);

    expect(currentStep(run)).toEqual({ kind: 'scene', scene: 'c1-1-scene' });
    expect(sceneOf(run, world, 'c1-1-scene')).toBeTruthy();

    const training = completeStep(run, world);

    expect(training.queue.map((step) => step.kind)).toEqual(['scene', 'training']);
  });

  it('shows a match’s line-up, the match, its result card, then the scenes after it', () => {
    let run = createStoryRun({ ...newSave({ seed: 3 }), stage: 2 }, world);

    expect(run.queue.map((step) => step.kind)).toEqual(['scene', 'prematch', 'match']);

    run = completeStep(completeStep(run, world), world);
    run = completeStep(run, world, matchResult(1, 0));

    expect(currentStep(run)).toMatchObject({ kind: 'postmatch', passed: true });
    expect(run.queue[1]).toEqual({ kind: 'scene', scene: 'c1-3-win' });
    expect(run.save.stage).toBe(3);
  });

  it('plays a lost knockout again without its opening scene', () => {
    let run = createStoryRun({ ...newSave({ seed: 3 }), stage: 3 }, world);

    run = completeStep(completeStep(run, world), world);
    run = completeStep(run, world, matchResult(0, 1));
    run = completeStep(completeStep(run, world), world);

    expect(run.save.stage).toBe(3);
    expect(run.queue.map((step) => step.kind)).toEqual(['prematch', 'match']);
  });

  it('runs the whole story to its end when every match is won', () => {
    const { run, seen } = playThrough(createStoryRun(newSave({ seed: 5 }), world));

    expect(run.finished).toBe(true);
    expect(seen.filter((kind) => kind === 'match').length).toBeGreaterThan(8);
    expect(seen.at(-1)).toBe('scene');
  });
});
