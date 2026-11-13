import { describe, expect, it } from 'vitest';
import { advance, deal, give } from '../../../src/sim/run.js';
import { startedRun } from '../../unit/sim/serving.js';

// A bill counted wrong was listed among the misses, and listed again when its customer then
// walked off, taking the place of another bill on the shutter.
describe('a bill counted wrong whose customer then walks off', () => {
  it('is listed among the misses once', () => {
    const run = startedRun();
    const { question } = run.queue[0];

    deal(run, question.answer === 500 ? 1000 : 500);
    give(run);
    advance(run, run.patience.left);

    expect(run.missed.filter((miss) => miss.question === question)).toHaveLength(1);
    expect(run.missed[0].direction).not.toBe('late');
  });
});
