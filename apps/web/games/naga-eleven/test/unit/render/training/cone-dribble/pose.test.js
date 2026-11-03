import { describe, expect, it } from 'vitest';
import { netSpot } from '../../../../../src/render/training/cone-dribble/goal.js';
import { runnerPose } from '../../../../../src/render/training/cone-dribble/pose.js';
import { createDrill } from '../../../../../src/training/index.js';
import { normalized } from '../../../../../src/sim/vector.js';

const KICK = { ticks: 10, lead: 5 };

// a run caught mid-lane, the runner moving as given; facing follows velocity as the drill sets it
function runningAt({ vx, vy, phase = 'play' }) {
  const state = createDrill('cone-dribble', { seed: 5, level: 1 });

  Object.assign(state, { phase, phaseTicks: 0 });
  Object.assign(state.run.runner, { x: 400, y: 100, vx, vy, facing: normalized(vx, vy) });

  return state;
}

// over the line, level with the net, in the phase and some ticks into it
function finishedAt(phase, phaseTicks) {
  const state = runningAt({ vx: 1.4, vy: -1.4, phase });
  const net = netSpot(state.run.course.goalX);

  state.phaseTicks = phaseTicks;
  state.run.finished = true;
  state.run.finishedAt = { x: state.run.course.finishX, y: net.y };
  Object.assign(state.run.runner, { x: state.run.course.finishX + 20, y: net.y });

  return state;
}

describe('the cone runner, drawn as a footballer', () => {
  it('runs side on, to the right, as he runs right', () => {
    expect(runnerPose(runningAt({ vx: 2.1, vy: 0 }), KICK)).toMatchObject({
      name: 'run',
      direction: 'east',
      loop: true,
    });
  });

  it('turns three-quarters away weaving up the lane, and toward the camera weaving down', () => {
    expect(runnerPose(runningAt({ vx: 1.5, vy: -1.5 }), KICK).direction).toBe('north-east');
    expect(runnerPose(runningAt({ vx: 1.5, vy: 1.5 }), KICK).direction).toBe('south-east');
  });

  it('runs to the left side on when he turns back', () => {
    expect(runnerPose(runningAt({ vx: -2, vy: 0 }), KICK).direction).toBe('west');
  });

  it('steps with the ground he covers', () => {
    const state = runningAt({ vx: 2.1, vy: 0 });

    state.run.runner.stride = 123;

    expect(runnerPose(state, KICK).stride).toBe(123);
  });

  it('stands facing down the lane before the start', () => {
    const state = createDrill('cone-dribble', { seed: 5, level: 1 });

    state.phase = 'ready';

    expect(runnerPose(state, KICK)).toMatchObject({ name: 'idle', direction: 'east' });
  });

  it('strikes the ball at the net as he crosses the line, from the strike on', () => {
    expect(runnerPose(finishedAt('finish', 0), KICK)).toMatchObject({
      name: 'kick',
      age: KICK.lead,
      direction: 'east',
    });
    expect(runnerPose(finishedAt('finish', KICK.ticks - 1), KICK).name).toBe('kick');
  });

  it('runs on past the line facing the net, counting the ground past it', () => {
    const state = finishedAt('finish', KICK.ticks);

    expect(runnerPose(state, KICK)).toMatchObject({ name: 'run', direction: 'east' });
    expect(runnerPose(state, KICK).stride).toBe(state.run.runner.stride + 20);
  });

  it('stands watching the net once he has stopped', () => {
    const state = finishedAt('result', 40);

    Object.assign(state.run.runner, { vx: 0, vy: 0 });

    expect(runnerPose(state, KICK)).toMatchObject({ name: 'idle', direction: 'east' });
  });
});
