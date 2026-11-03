import { describe, expect, it } from 'vitest';
import { newSave } from '../../../../src/campaign/index.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import {
  completeStep,
  createStoryRun,
  currentStep,
  sceneOf,
} from '../../../../src/ui/flow/story-run.js';

const world = { chapters: CHAPTERS, teams: TEAMS };

const won = {
  goalsFor: 2,
  goalsAgainst: 1,
  penalties: null,
  unlocked: [],
  duelsWon: 1,
  goalsBySochetra: 1,
};
const lost = { ...won, goalsFor: 0, goalsAgainst: 2, goalsBySochetra: 0 };

// a player who wins everything but the two group openers the story means them to lose
function play(run, step) {
  const opener =
    run.stage?.rule === 'group' && ['japan-youth', 'brazil'].includes(run.stage.opponent);

  return {
    training: () => ({ drill: step.drill, score: 1000, grade: 'A' }),
    match: () => (opener ? lost : won),
  }[step.kind]?.();
}

describe('the real story, played through', () => {
  it('runs every chapter to the epilogue, every scene it shows existing', () => {
    let run = createStoryRun(newSave({ seed: 11 }), world);
    const shown = [];

    for (let i = 0; i < 2000 && !run.finished; i += 1) {
      const step = currentStep(run);

      if (step.kind === 'scene') {
        expect(sceneOf(run, world, step.scene), step.scene).toBeTruthy();
      }

      shown.push(step);
      run = completeStep(run, world, play(run, step));
    }

    const matches = shown.filter((step) => step.kind === 'match').length;

    expect(run.finished).toBe(true);
    expect(matches).toBeGreaterThanOrEqual(15);
    expect(run.save.hero.level).toBeGreaterThanOrEqual(35);
    expect(run.save.hero.moves).toEqual(
      expect.arrayContaining([
        'naga-shot',
        'hanuman-leap',
        'garuda-volley',
        'twin-naga',
        'seven-headed-naga',
      ]),
    );
  });
});
