import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { leadOf, opennessOf, passBall, passTargetOf } from '../../../src/sim/passing.js';
import { holdBallAt, matchInPlay, only } from '../../support/match-driver.js';

function lineUp(match, places) {
  for (const [index, place] of Object.entries(places)) {
    Object.assign(match.players[index], place, { vx: 0, vy: 0, stun: 0, noPickup: 0 });
  }
}

describe('picking whom to pass to', () => {
  it('picks the mate along the line the passer aims', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 600, y: 500 });

    only(match, [passer.index, 1, 4]);
    lineUp(match, { 1: { x: 600, y: 700 }, 4: { x: 800, y: 510 } });

    expect(passTargetOf(match, passer, { x: 1, y: 0 }).index).toBe(4);
    expect(passTargetOf(match, passer, { x: 0, y: 1 }).index).toBe(1);
  });

  it('picks no one when no mate stands that way', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 600, y: 500 });

    only(match, [passer.index, 4]);
    lineUp(match, { 4: { x: 800, y: 510 } });

    expect(passTargetOf(match, passer, { x: -1, y: 0 })).toBe(null);
  });

  it('reaches further for a mate in the air than along the grass', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 300, y: 500 });

    only(match, [passer.index, 4]);
    lineUp(match, { 4: { x: 1100, y: 500 } });

    expect(passTargetOf(match, passer, { x: 1, y: 0 })).toBe(null);
    expect(passTargetOf(match, passer, { x: 1, y: 0 }, { lofted: true }).index).toBe(4);
  });
});

describe('a pass', () => {
  it('rolls toward the mate and tells them it is coming', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 600, y: 500 });
    const mate = match.players[4];

    only(match, [passer.index, 4]);
    lineUp(match, { 4: { x: 850, y: 500 } });
    match.events = [];
    passBall(match, passer, { aim: { x: 1, y: 0 } });

    expect(match.ball.owner).toBe(null);
    expect(match.ball.vz).toBe(0);
    expect(match.ball.vx).toBeGreaterThan(KICK.passMin - 0.01);
    expect(mate.receiving).toBeGreaterThanOrEqual(KICK.receiveTicks);
    expect(match.events).toEqual([{ type: 'pass', player: passer.index }]);
  });

  it('hands the player the mate they pass to', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 600, y: 500 });

    only(match, [passer.index, 4]);
    lineUp(match, { 4: { x: 850, y: 500 } });
    passBall(match, passer, { aim: { x: 1, y: 0 } });

    expect(match.controlled).toBe(4);
  });

  it('goes in the air when lofted, to the spot a brain picked', () => {
    const match = matchInPlay();
    const passer = holdBallAt(match, { x: 600, y: 500 });

    passBall(match, passer, { target: 9, spot: { x: 1200, y: 300 }, lofted: true });

    expect(match.ball.vz).toBeGreaterThan(3);
    expect(match.players[9].receiving).toBeGreaterThan(KICK.loftTicks[0]);
  });

  it('is struck only by the one who has the ball', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 400, y: 200 });

    passBall(match, match.players[2], { aim: { x: 1, y: 0 } });

    expect(match.ball.owner).toBe(carrier.index);
  });
});

describe('where a pass goes and who is free', () => {
  it('leads a running mate', () => {
    const match = matchInPlay();
    const mate = Object.assign(match.players[4], { x: 800, y: 500, vx: 3, vy: 0 });

    expect(leadOf(match, mate, { x: 500, y: 500 }).x).toBeGreaterThan(820);
  });

  it('measures how far the nearest opponent stands', () => {
    const match = matchInPlay();

    only(match, [12]);
    Object.assign(match.players[12], { x: 500, y: 400 });

    expect(opennessOf(match, { x: 530, y: 440 }, 0)).toBeCloseTo(50);
  });
});
