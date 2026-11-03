import { describe, expect, it } from 'vitest';
import { watchBall } from '../../../../src/audio/hear/ball-watch.js';
import { createEar, earFor } from '../../../../src/audio/hear/ear.js';
import { createMatch } from '../../../../src/sim/create-match.js';

const names = (cues) => cues.map((each) => each.cue);

function looseMatch() {
  const match = createMatch({ seed: 1, humanTeam: 0 });

  Object.assign(match.ball, { owner: null, inGoal: null, x: 500, y: 200, z: 0, vx: 0, vy: 0 });

  return match;
}

function listen(match, ear, events = []) {
  match.tick += 1;
  earFor(ear, match);

  return watchBall(match, ear, events);
}

describe('what the ball does without an event', () => {
  it('hears a header that pushed no event, and a clearance from the feet as a lofted kick', () => {
    const match = looseMatch();
    const ear = createEar();
    const player = match.players[3];

    listen(match, ear);
    player.lastKick = match.tick + 1;
    Object.assign(match.ball, { z: 45, vz: 1 });

    expect(names(listen(match, ear))).toEqual(['header']);

    player.lastKick = match.tick + 1;
    Object.assign(match.ball, { z: 2, vz: 5 });

    expect(names(listen(match, ear))).toEqual(['loft']);
  });

  it('leaves a kick to its own event, and hears nothing the first time it listens', () => {
    const match = looseMatch();
    const ear = createEar();

    match.players[3].lastKick = 50;

    expect(listen(match, ear)).toEqual([]);

    match.players[3].lastKick = match.tick + 1;

    expect(listen(match, ear, [{ type: 'pass', player: 3 }])).toEqual([]);
  });

  it('rings the post when a loose ball turns back off it', () => {
    const match = looseMatch();
    const ear = createEar();
    const postY = match.pitch.width / 2 + match.goal.width / 2;

    Object.assign(match.ball, { x: match.pitch.length - 6, y: postY - 4, z: 10, vx: 9, vy: 1 });
    listen(match, ear);
    Object.assign(match.ball, { vx: -5, vy: 1 });

    const cues = listen(match, ear);

    expect(names(cues)).toEqual(['post', 'ooh']);
    expect(cues[0].options.bar).toBe(false);
  });

  it('rings the bar higher up, in the mouth', () => {
    const match = looseMatch();
    const ear = createEar();

    Object.assign(match.ball, {
      x: 4,
      y: match.pitch.width / 2,
      z: match.goal.height,
      vx: -9,
      vy: 0,
    });
    listen(match, ear);
    Object.assign(match.ball, { vx: 5 });

    expect(listen(match, ear)[0].options.bar).toBe(true);
  });

  it('hears no post when the ball turns in midfield, is saved, or lies in the net', () => {
    const match = looseMatch();
    const ear = createEar();

    listen(match, ear);
    Object.assign(match.ball, { vx: 9 });
    listen(match, ear);
    Object.assign(match.ball, { vx: -9 });

    expect(listen(match, ear)).toEqual([]);

    Object.assign(match.ball, { x: 4, y: match.pitch.width / 2, z: match.goal.height, vx: -9 });
    listen(match, ear);
    Object.assign(match.ball, { vx: 5 });

    expect(listen(match, ear, [{ type: 'save', keeper: 0, parried: true }])).toEqual([]);
  });

  it('starts over when a new match is heard from its first tick', () => {
    const ear = createEar();
    const match = looseMatch();

    match.tick = 500;
    listen(match, ear);
    match.tick = 0;
    earFor(ear, match);

    expect(ear.heardKick).toBe(null);
  });
});
