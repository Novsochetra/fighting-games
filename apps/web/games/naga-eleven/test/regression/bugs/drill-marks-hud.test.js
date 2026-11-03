import { describe, expect, it } from 'vitest';
import { HUD_BOTTOM } from '../../../src/render/training/hud.js';
import { drawMarks } from '../../../src/render/training/marks.js';
import { shotMarkPlace } from '../../../src/render/training/target-shot/scene.js';
import { createDrill } from '../../../src/training/index.js';
import { MARK_TICKS } from '../../../src/training/scoring.js';
import { TARGETS } from '../../../src/training/target-shot/targets.js';
import { createRecordingContext } from '../../support/recording-context.js';

// a late hit on a top target rose to about y 57, its words sliding under the drill's HUD panels
function wordsAt(mark, age) {
  const state = createDrill('target-shot', { seed: 4 });
  const { context, calls } = createRecordingContext();

  context.globalAlpha = 1;
  context.measureText = (text) => ({ width: [...text].length * 12 });
  state.tick = 500;
  state.marks = [{ ...mark, at: state.tick - age }];
  drawMarks(context, state, { placeOf: shotMarkPlace, lang: 'en' });

  return calls.filter((call) => call.name === 'fillText').map((call) => call.args[2]);
}

describe('the words a shot pops', () => {
  it.each(TARGETS.map((target, i) => [i, target]))(
    'stay under the HUD all their rise, over target %i',
    (_, target) => {
      for (let age = 0; age < MARK_TICKS; age += 4) {
        const tops = wordsAt({ kind: 'lateHit', points: 160, ...target }, age);

        expect(tops.length).toBeGreaterThan(0);

        for (const top of tops) {
          expect(top).toBeGreaterThanOrEqual(HUD_BOTTOM);
        }
      }
    },
  );
});
