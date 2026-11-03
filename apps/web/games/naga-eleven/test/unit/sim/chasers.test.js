import { describe, expect, it } from 'vitest';
import { chaserOf } from '../../../src/sim/chasers.js';
import { looseBallAt, matchInPlay, only } from '../../support/match-driver.js';

function place(match, places) {
  for (const [index, spot] of Object.entries(places)) {
    Object.assign(match.players[index], spot, { vx: 0, vy: 0, stun: 0, noPickup: 0 });
  }
}

// a ball rolling from x = 500 along y = 540 toward a mate of side 0 waiting at x = 800
function passToward(match, mateSpot) {
  looseBallAt(match, { x: 500, y: 540, vx: 7, lastTouch: 6, kick: 'pass' });
  match.players[10].receiving = 60;
  place(match, { 10: mateSpot });
}

describe('who goes for the ball', () => {
  it('is the receiver of a pass, on his side', () => {
    const match = matchInPlay(4);

    only(match, [6, 10, 15]);
    passToward(match, { x: 800, y: 540 });
    place(match, { 15: { x: 650, y: 560 } });

    expect(chaserOf(match, 0)).toBe(10);
  });

  it('is a defender who gets to a pass well before its receiver', () => {
    const match = matchInPlay(4);

    only(match, [6, 10, 15]);
    passToward(match, { x: 800, y: 540 });
    place(match, { 15: { x: 600, y: 556 } });

    expect(chaserOf(match, 1)).toBe(15);
  });

  it('is no defender who would only race the receiver to it and lose', () => {
    const match = matchInPlay(4);

    only(match, [6, 10, 15]);
    passToward(match, { x: 800, y: 540 });
    place(match, { 15: { x: 860, y: 600 } });

    expect(chaserOf(match, 1)).toBe(null);
  });

  it('is a defender in his own box, whoever the ball was played to', () => {
    const match = matchInPlay(4);

    only(match, [6, 10, 15]);
    looseBallAt(match, { x: 1450, y: 540, vx: 6, lastTouch: 6, kick: 'pass' });
    match.players[10].receiving = 60;
    place(match, { 10: { x: 1650, y: 540 }, 15: { x: 1680, y: 600 } });

    expect(chaserOf(match, 1)).toBe(15);
  });

  it('is whoever gets to a loose ball first', () => {
    const match = matchInPlay(4);

    only(match, [6, 15]);
    looseBallAt(match, { x: 900, y: 540, lastTouch: 6 });
    place(match, { 15: { x: 950, y: 540 } });

    expect(chaserOf(match, 1)).toBe(15);
  });

  it('is, for a long ball in the air, the defender nearest where it comes down too', () => {
    const match = matchInPlay(4);

    only(match, [6, 10, 15]);
    looseBallAt(match, { x: 500, y: 540, z: 20, vx: 7, vz: 4, lastTouch: 6, kick: 'pass' });
    match.players[10].receiving = 80;
    place(match, { 10: { x: 900, y: 540 }, 15: { x: 930, y: 570 } });

    expect(chaserOf(match, 1)).toBe(15);
  });

  it('is, for the player’s side with a loose ball, never the man the player steers', () => {
    const match = matchInPlay(4);

    only(match, [6, 9]);
    looseBallAt(match, { x: 900, y: 540, lastTouch: 15 });
    place(match, { 9: { x: 920, y: 540 }, 6: { x: 700, y: 540 } });
    match.controlled = 9;

    expect(chaserOf(match, 0)).toBe(6);
  });
});
