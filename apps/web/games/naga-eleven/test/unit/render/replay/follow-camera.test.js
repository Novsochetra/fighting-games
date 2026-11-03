import { describe, expect, it } from 'vitest';
import { createFollowCamera, followBall } from '../../../../src/render/replay/follow-camera.js';

// a camera API that keeps what it was asked, standing in for src/render/camera.js
function fakeApi() {
  const calls = [];

  return {
    calls,
    createCamera: () => ({ fake: true }),
    updateCamera: (camera) => calls.push({ name: 'update', camera }),
    panCamera: (camera, target) => calls.push({ name: 'pan', target }),
    shakeCamera: (camera, power) => calls.push({ name: 'shake', power }),
  };
}

const frameAt = (x, events = []) => ({ ball: { x, y: 200, vx: 0 }, events });

const pans = (api) => api.calls.filter((call) => call.name === 'pan');

describe("the replay's camera", () => {
  it('starts on the ball', () => {
    const api = fakeApi();

    createFollowCamera(frameAt(300), api);

    expect(pans(api)).toEqual([{ name: 'pan', target: { x: 300, y: 200, ticks: 1 } }]);
    expect(api.calls.at(-1).name).toBe('update');
  });

  it('eases after the ball, a pan of one tick at a time', () => {
    const api = fakeApi();
    const follow = createFollowCamera(frameAt(300), api);

    followBall(follow, frameAt(400));
    followBall(follow, frameAt(400));

    const [first, second] = pans(api).slice(1);

    expect(first.target.x).toBeGreaterThan(300);
    expect(first.target.x).toBeLessThan(400);
    expect(second.target.x).toBeGreaterThan(first.target.x);
    expect(second.target.ticks).toBe(1);
  });

  it('looks ahead of a ball on the move', () => {
    const api = fakeApi();
    const frame = { ball: { x: 300, y: 200, vx: 5 }, events: [] };

    createFollowCamera(frame, api);

    expect(pans(api)[0].target.x).toBeGreaterThan(300);
  });

  it('jolts as the ball goes in', () => {
    const api = fakeApi();
    const follow = createFollowCamera(frameAt(300), api);

    followBall(follow, frameAt(300, [{ type: 'goal', team: 0 }]));

    expect(api.calls.some((call) => call.name === 'shake')).toBe(true);
  });

  it('is nothing without a camera that pans', () => {
    const follow = createFollowCamera(frameAt(300), { createCamera: () => ({}) });

    expect(follow).toBeNull();
    expect(() => followBall(follow, frameAt(300))).not.toThrow();
  });
});
