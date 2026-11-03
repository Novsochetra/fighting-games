import { describe, expect, it } from 'vitest';
import { clearPresses, createInput } from '../../../../src/sim/input-state.js';
import {
  createTrainingSession,
  drawTrainingSession,
  isTrainingSessionDone,
  stepTrainingSession,
  trainingResultOf,
} from '../../../../src/ui/flow/training-session.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

// a player who does nothing but press pass now and then: the drill still runs to its result
function idleThrough(session, input, most = 6000) {
  for (let i = 0; i < most && !isTrainingSessionDone(session); i += 1) {
    if (i % 30 === 0) {
      input.pressed.pass = true;
    }

    stepTrainingSession(session, input);
    clearPresses(input);
  }
}

describe('a training session', () => {
  it.each(['cone-dribble', 'target-shot', 'spirit-focus'])(
    'runs %s to a graded result',
    (drill) => {
      const input = createInput();
      const session = createTrainingSession(drill, { seed: 7, level: 1, lang: 'en' });

      idleThrough(session, input);

      expect(isTrainingSessionDone(session)).toBe(true);
      expect(trainingResultOf(session)).toMatchObject({ drill, grade: expect.any(String) });
    },
  );

  it('draws its screen', () => {
    const canvas = createPixelCanvas(768, 432);
    const session = createTrainingSession('spirit-focus', { seed: 7, level: 1, lang: 'km' });

    drawTrainingSession(canvas.getContext('2d'), session, { tick: 10 });

    expect(canvas.data.some((value) => value > 0)).toBe(true);
  });
});
