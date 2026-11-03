import { describe, expect, it } from 'vitest';
import { meeterOf } from '../../../src/sim/meet.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

describe('who meets the ball', () => {
  it('is a player the ball flew past this tick, though it ends the tick out of their reach', () => {
    const match = matchInPlay();

    only(match, [5]);
    Object.assign(match.players[5], { x: 510, y: 300 });
    looseBallAt(match, { x: 530, y: 300, vx: 15 });

    expect(meeterOf(match).player.index).toBe(5);
  });

  it('is the nearest of those in reach', () => {
    const match = matchInPlay();

    only(match, [5, 16]);
    Object.assign(match.players[5], { x: 500, y: 300 });
    Object.assign(match.players[16], { x: 506, y: 300 });
    looseBallAt(match, { x: 508, y: 300 });

    expect(meeterOf(match).player.index).toBe(16);
  });

  it('is the mate a pass was played to when he reaches it nearly as near', () => {
    const match = matchInPlay();

    only(match, [5, 16]);
    Object.assign(match.players[5], { x: 500, y: 306, receiving: 30 });
    Object.assign(match.players[16], { x: 500, y: 296 });
    looseBallAt(match, { x: 500, y: 300 });

    expect(meeterOf(match).player.index).toBe(5);

    match.players[5].receiving = 0;
    expect(meeterOf(match).player.index).toBe(16);
  });

  it('is the nearer defender in his own box, whoever the ball was played to', () => {
    const match = matchInPlay();

    only(match, [5, 16]);
    Object.assign(match.players[5], { x: 1700, y: 546, receiving: 30 });
    Object.assign(match.players[16], { x: 1700, y: 536 });
    looseBallAt(match, { x: 1700, y: 540 });

    expect(meeterOf(match).player.index).toBe(16);
  });

  it('is no outfield player for a lofted pass climbing off the foot', () => {
    const match = matchInPlay();

    only(match, [16]);
    Object.assign(match.players[16], { x: 512, y: 300 });
    looseBallAt(match, { x: 506, y: 300, z: 6, vx: 10, vz: 5, kick: 'pass' });

    expect(meeterOf(match)).toBe(null);
  });

  it('is a keeper in their box from further off and higher up, at a stretch', () => {
    const match = matchInPlay();
    const keeper = match.players[11];

    only(match, [11]);
    Object.assign(keeper, { x: match.pitch.length - 20, y: 540 });
    looseBallAt(match, { x: match.pitch.length - 20, y: 560, z: 65 });

    const meeting = meeterOf(match);

    expect(meeting).toMatchObject({ keeper: true });
    expect(meeting.stretch).toBeGreaterThan(0.5);
  });

  it('is no one on the ground or stunned', () => {
    const match = matchInPlay();

    only(match, [5]);
    Object.assign(match.players[5], { x: 500, y: 300, stun: 10 });
    looseBallAt(match, { x: 502, y: 300 });

    expect(meeterOf(match)).toBe(null);
  });

  it('is the man the player steers when he and an opponent reach a loose ball together', () => {
    const match = matchInPlay();

    only(match, [5, 16]);
    Object.assign(match.players[5], { x: 500, y: 304 });
    Object.assign(match.players[16], { x: 500, y: 297 });
    looseBallAt(match, { x: 500, y: 300 });
    match.controlled = 5;

    expect(meeterOf(match).player.index).toBe(5);
  });
});
