import { describe, expect, it } from 'vitest';
import {
  createRecorder,
  recordFrame,
  recordedFrames,
} from '../../../../src/render/replay/recorder.js';
import { advance, fakeMatch } from './fake-match.js';

function record(recorder, match, ticks, eventsAt = {}) {
  for (let i = 0; i < ticks; i += 1) {
    advance(match, { events: eventsAt[match.tick + 1] ?? [] });
    recordFrame(recorder, match);
  }
}

describe('the recorder', () => {
  it('keeps five seconds of 60 ticks by default', () => {
    expect(createRecorder().size).toBe(300);
    expect(createRecorder({ seconds: 2 }).size).toBe(120);
  });

  it('copies values, so changing the match later changes nothing kept', () => {
    const recorder = createRecorder({ seconds: 1 });
    const match = fakeMatch();
    const goal = { type: 'goal', team: 0, scorer: 1, move: null };

    record(recorder, match, 1, { 1: [goal] });
    match.players[1].x = 9999;
    match.players[1].facing.x = -1;
    match.ball.x = -50;
    match.score[0] = 7;
    goal.team = 1;
    match.players[1].name.en = 'Changed';

    const [kept] = recordedFrames(recorder);

    expect(kept.players[1].x).toBe(111);
    expect(kept.players[1].facingX).toBe(1);
    expect(kept.ball.x).toBe(482);
    expect(kept.score).toEqual([0, 0]);
    expect(kept.events).toEqual([{ type: 'goal', team: 0, scorer: 1, move: null }]);
    expect(recorder.cast.players[1].name.en).toBe('Player 1');
  });

  it('never holds an object of the live match', () => {
    const recorder = createRecorder({ seconds: 1 });
    const match = fakeMatch();
    const duel = { id: 3, outcome: { winner: 1 }, rounds: [{ picked: {} }] };

    match.players[1].dive = { tick: 1, side: -1 };
    match.restart = { kind: 'corner', team: 1, x: 0, y: 0 };
    record(recorder, match, 1, { 1: [{ type: 'duelEnd', duel }] });

    const slot = recorder.slots[0];
    const live = new Set([match, match.ball, match.score, match.restart, duel, duel.outcome]);

    for (const player of match.players) {
      live.add(player).add(player.facing).add(player.dive).add(player.name);
    }

    const kept = [slot, slot.ball, slot.score, slot.restart, slot.players[1].dive];

    kept.push(slot.events[0], slot.events[0].duel, slot.events[0].duel.outcome);
    expect(kept.some((value) => live.has(value))).toBe(false);
    expect(slot.events[0].duel.outcome.winner).toBe(1);
  });

  it('writes over its oldest frame once the ring is full', () => {
    const recorder = createRecorder({ seconds: 0.05 });
    const match = fakeMatch();

    record(recorder, match, 7);

    expect(recorder.size).toBe(3);
    expect(recorder.count).toBe(3);
    expect(recorder.slots).toHaveLength(3);
    expect(recordedFrames(recorder).map((frame) => frame.tick)).toEqual([5, 6, 7]);
  });

  it('keeps the same objects as it wraps, so a match makes no garbage', () => {
    const recorder = createRecorder({ seconds: 0.05 });
    const match = fakeMatch();

    record(recorder, match, 3);

    const slots = [...recorder.slots];

    record(recorder, match, 6);
    expect(recorder.slots.every((slot, i) => slot === slots[i])).toBe(true);
  });

  it('keeps no frame of a duel, and puts what happened in it on the next frame', () => {
    const recorder = createRecorder({ seconds: 1 });
    const match = fakeMatch();

    record(recorder, match, 2);
    match.phase = 'duel';
    record(recorder, match, 3, { 3: [{ type: 'duel', duel: { id: 1 } }] });
    match.phase = 'play';
    record(recorder, match, 1);

    const frames = recordedFrames(recorder);

    expect(frames.map((frame) => frame.tick)).toEqual([1, 2, 6]);
    expect(frames[2].events).toEqual([{ type: 'duel', duel: { id: 1 } }]);
  });

  it('starts a fresh tape when a new match begins', () => {
    const recorder = createRecorder({ seconds: 1 });

    record(recorder, fakeMatch(), 5);
    record(recorder, fakeMatch({ players: 6 }), 2);

    expect(recordedFrames(recorder).map((frame) => frame.tick)).toEqual([1, 2]);
    expect(recorder.cast.players).toHaveLength(6);
  });

  it('writes the same tick over itself when it is recorded twice', () => {
    const recorder = createRecorder({ seconds: 1 });
    const match = fakeMatch();

    record(recorder, match, 2);
    match.ball.x = 1;
    recordFrame(recorder, match);

    const frames = recordedFrames(recorder);

    expect(frames).toHaveLength(2);
    expect(frames[1].ball.x).toBe(1);
  });

  it('hands out copies of the tape, so recording on never changes one', () => {
    const recorder = createRecorder({ seconds: 0.05 });
    const match = fakeMatch();

    record(recorder, match, 3);

    const tape = recordedFrames(recorder);

    record(recorder, match, 3);
    expect(tape.map((frame) => frame.tick)).toEqual([1, 2, 3]);
  });
});
