import { describe, expect, it } from 'vitest';
import { createRecorder, recordFrame } from '../../../../src/render/replay/recorder.js';
import {
  createReplay,
  isReplayDone,
  isSlowMotion,
  replayCamera,
  replayFrameMatch,
  stepReplay,
} from '../../../../src/render/replay/replay.js';
import { advance, fakeMatch } from './fake-match.js';

// the replay's own camera is tested in follow-camera.test.js and through the real one in the
// integration tests; here it is one that does nothing
const STILL_CAMERA = {
  createCamera: () => ({}),
  updateCamera: () => {},
  panCamera: () => {},
};

const replayOf = (recorder, options = {}) =>
  createReplay(recorder, { camera: STILL_CAMERA, ...options });

const GOAL = { type: 'goal', team: 0, scorer: 1, move: null };

// a tape of `ticks` frames with a goal on tick `goalAt`
function tape({ ticks = 300, goalAt = 260 } = {}) {
  const recorder = createRecorder();
  const match = fakeMatch();

  for (let i = 0; i < ticks; i += 1) {
    advance(match, { events: match.tick + 1 === goalAt ? [GOAL] : [] });
    recordFrame(recorder, match);
  }

  return { recorder, match };
}

function playOut(replay) {
  const ticks = [];

  while (!isReplayDone(replay) && ticks.length < 2000) {
    ticks.push(replayFrameMatch(replay).tick);
    stepReplay(replay);
  }

  return ticks;
}

describe('a goal replay', () => {
  it('starts four seconds before the goal and ends a little after it', () => {
    const { recorder } = tape();
    const replay = replayOf(recorder);

    expect(replay.frames[0].tick).toBe(20);
    expect(replay.frames[replay.goalAt].tick).toBe(260);
    expect(replay.frames.at(-1).tick).toBe(300);
  });

  it('takes how far back it starts from fromTicksBefore', () => {
    const { recorder } = tape();

    expect(replayOf(recorder, { fromTicksBefore: 60 }).frames[0].tick).toBe(200);
    expect(replayOf(recorder, { fromTicksBefore: 999 }).frames[0].tick).toBe(1);
  });

  it('plays the frames oldest first, at half speed for the two seconds before the goal', () => {
    const { recorder } = tape();
    const ticks = playOut(replayOf(recorder));
    const before = ticks.filter((tick) => tick < 140);
    const slow = ticks.filter((tick) => tick >= 140 && tick < 260);
    const after = ticks.filter((tick) => tick >= 260);

    expect(ticks).toEqual([...ticks].sort((first, second) => first - second));
    expect(before).toHaveLength(120);
    expect(slow).toHaveLength(240);
    expect(after).toHaveLength(41);
  });

  it('glides the players and the ball between frames while it plays slow', () => {
    const { recorder } = tape();
    const replay = replayOf(recorder);

    while (!isSlowMotion(replay)) {
      stepReplay(replay);
    }

    stepReplay(replay);

    const frame = replayFrameMatch(replay);
    const [from, to] = [replay.frames[120], replay.frames[121]];

    expect(isSlowMotion(replay)).toBe(true);
    expect(frame.ball.x).toBe((from.ball.x + to.ball.x) / 2);
    expect(frame.players[1].x).toBe((from.players[1].x + to.players[1].x) / 2);
    expect(frame.tick).toBe(from.tick);
  });

  it('tells each frame what happened once, however slowly it plays', () => {
    const { recorder } = tape();
    const replay = replayOf(recorder);
    let goals = 0;

    while (!isReplayDone(replay)) {
      goals += replayFrameMatch(replay).events.filter((event) => event.type === 'goal').length;
      stepReplay(replay);
    }

    expect(goals).toBe(1);
  });

  it('is a match without anyone steered, so the replay shows no ring or card', () => {
    const { recorder } = tape();
    const frame = replayFrameMatch(replayOf(recorder));

    expect(frame.controlled).toBeNull();
    expect(frame.humanTeam).toBeNull();
    expect(frame.teams[0].short).toBe('CAM');
    expect(frame.players).toHaveLength(4);
    expect(frame.players[1].name).toEqual({ en: 'Player 1', km: 'កីឡាករ' });
  });

  it('plays the same however the match records on after it is made', () => {
    const { recorder, match } = tape();
    const replay = replayOf(recorder);
    const first = replay.frames[0].ball.x;

    for (let i = 0; i < 300; i += 1) {
      advance(match);
      recordFrame(recorder, match);
    }

    expect(replay.frames[0].ball.x).toBe(first);
  });

  it('ends on a press of pass', () => {
    const { recorder } = tape();
    const replay = replayOf(recorder);

    stepReplay(replay);
    stepReplay(replay, { pass: true });

    expect(isReplayDone(replay)).toBe(true);
    expect(replay.skipped).toBe(true);
  });

  it('plays the newest frames when the tape holds no goal', () => {
    const { recorder } = tape({ goalAt: -1 });
    const replay = replayOf(recorder);

    expect(replay.frames.at(-1).tick).toBe(300);
    expect(replay.frames[0].tick).toBe(60);
  });

  it('is done at once from an empty tape', () => {
    const replay = createReplay(createRecorder());

    expect(isReplayDone(replay)).toBe(true);
    expect(replayCamera(replay)).toBeNull();
    expect(() => stepReplay(replay)).not.toThrow();
  });
});
