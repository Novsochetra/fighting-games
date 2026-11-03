import { describe, expect, it } from 'vitest';
import {
  goalCelebration,
  isCueDone,
  kickoffSweep,
  stepCue,
} from '../../../../src/render/cinematics/cues/camera-cues.js';

function fakeApi() {
  const calls = [];

  return {
    calls,
    panCamera: (camera, target) => calls.push({ name: 'pan', ...target }),
    shakeCamera: (camera, power) => calls.push({ name: 'shake', power }),
  };
}

const match = {
  pitch: { length: 960, width: 420 },
  players: [
    { index: 0, x: 100, y: 200 },
    { index: 1, x: 900, y: 100 },
  ],
};

function run(cue, ticks) {
  for (let i = 0; i < ticks; i += 1) {
    stepCue(cue, {}, match);
  }
}

describe('the kickoff sweep', () => {
  it('cuts to a goal, holds there, then glides slowly to the centre spot', () => {
    const api = fakeApi();
    const cue = kickoffSweep({}, match, { api });

    run(cue, 25);

    const holds = api.calls.filter((call) => call.ticks === 1);
    const glide = api.calls.find((call) => call.ticks > 1);

    expect(holds.length).toBeGreaterThan(10);
    expect(holds.every((call) => call.x === 0 && call.y === 210)).toBe(true);
    expect(glide).toEqual({ name: 'pan', x: 480, y: 210, ticks: 150 });
    expect(api.calls.filter((call) => call.ticks > 1)).toHaveLength(1);
  });

  it('starts from the other goal when asked', () => {
    const api = fakeApi();

    stepCue(kickoffSweep({}, match, { api, fromEnd: 1 }), {}, match);

    expect(api.calls[0].x).toBe(960);
  });

  it('is over once the glide is', () => {
    const cue = kickoffSweep({}, match, { api: fakeApi() });

    run(cue, cue.length - 1);
    expect(isCueDone(cue)).toBe(false);
    expect(stepCue(cue, {}, match)).toBe(false);
    expect(isCueDone(cue)).toBe(true);
  });
});

describe('the goal celebration', () => {
  it('jolts the camera and follows the scorer for two seconds', () => {
    const api = fakeApi();
    const cue = goalCelebration({}, match, 1, { api });

    run(cue, 200);

    const pans = api.calls.filter((call) => call.name === 'pan');

    expect(api.calls[0].name).toBe('shake');
    expect(pans).toHaveLength(120);
    expect(pans.every((call) => call.ticks === 1)).toBe(true);
    expect(isCueDone(cue)).toBe(true);
  });

  it('eases after the scorer as they run', () => {
    const api = fakeApi();
    const cue = goalCelebration({}, match, match.players[0], { api });

    match.players[0].x = 200;
    run(cue, 2);
    match.players[0].x = 100;

    const [first, second] = api.calls.filter((call) => call.name === 'pan');

    expect(first.x).toBeGreaterThan(100);
    expect(second.x).toBeGreaterThan(first.x);
    expect(second.x).toBeLessThan(200);
  });
});

describe('a camera without the moves', () => {
  it('gets no cue, and stepping none does nothing', () => {
    expect(kickoffSweep({}, match, { api: {} })).toBeNull();
    expect(goalCelebration({}, match, 1, { api: {} })).toBeNull();
    expect(goalCelebration(null, match, 1, { api: fakeApi() })).toBeNull();
    expect(goalCelebration({}, match, null, { api: fakeApi() })).toBeNull();
    expect(stepCue(null, {}, match)).toBe(false);
  });
});
